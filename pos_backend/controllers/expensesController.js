const Expenses = require("../models/expensesModel");
const ExpenseCategory = require("../models/expenseCategoryModel");
const Employee = require("../models/employeeModel");
const EmployeeWithdrawal = require("../models/employeeWithdrawalModel");
const createHttpError = require("http-errors");
const mongoose = require("mongoose");

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const pad = (n) => String(n).padStart(2, "0");
const round2 = (n) => Math.round(n * 100) / 100;
const serverToday = () => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};
// The client sends its own local calendar day — the server may run in UTC
const readDate = (value) =>
  typeof value === "string" && DATE_RE.test(value) ? value : serverToday();

const getDateRange = (date) => {
  if (date === "all") return null;
  if (typeof date === "string" && DATE_RE.test(date)) {
    const [y, m, d] = date.split("-").map(Number);
    const startOfDay = new Date(y, m - 1, d, 0, 0, 0, 0);
    const endOfDay = new Date(y, m - 1, d, 23, 59, 59, 999);
    return { $gte: startOfDay, $lte: endOfDay };
  }
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);
  return { $gte: startOfDay, $lte: endOfDay };
};

const ensureObjectId = (id, label) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createHttpError(400, `Invalid ${label} ID!`);
  }
};

const EMPLOYEE_LABEL_EN = "Employee Advance";
const EMPLOYEE_LABEL_SI = "සේවක අත්තිකාරම්";

/**
 * Turn the request body into expense fields. Exactly one of:
 *  - employeeId  → cash handed to an employee (deducted from their salary)
 *  - categoryId  → an admin-defined expense category
 *  - description → legacy free-text record
 * `currentEmployeeId` lets an existing advance be edited after the employee
 * was deactivated; new advances need an active employee.
 */
const resolveExpenseInput = async (body = {}, currentEmployeeId = null) => {
  const amount = round2(Number(body.amount));
  if (!Number.isFinite(amount) || amount <= 0) {
    throw createHttpError(400, "Amount must be greater than zero!");
  }

  if (body.employeeId) {
    ensureObjectId(body.employeeId, "Employee");
    const employee = await Employee.findById(body.employeeId, "name isActive").lean();
    if (!employee) throw createHttpError(404, "Employee not found!");
    const isSameEmployee = currentEmployeeId?.toString() === employee._id.toString();
    if (!employee.isActive && !isSameEmployee) {
      throw createHttpError(400, `${employee.name} is no longer an active employee!`);
    }
    return {
      amount,
      category: null,
      employee: employee._id,
      description: `${EMPLOYEE_LABEL_EN} - ${employee.name}`,
      descriptionSi: `${EMPLOYEE_LABEL_SI} - ${employee.name}`,
    };
  }

  if (body.categoryId) {
    ensureObjectId(body.categoryId, "Category");
    const category = await ExpenseCategory.findById(body.categoryId).lean();
    if (!category) throw createHttpError(404, "Expense category not found!");
    return {
      amount,
      category: category._id,
      employee: null,
      description: category.nameEn,
      descriptionSi: category.nameSi,
    };
  }

  const description = typeof body.description === "string" ? body.description.trim() : "";
  if (!description) throw createHttpError(400, "Please select an expense category!");
  return { amount, category: null, employee: null, description, descriptionSi: "" };
};

/**
 * Mirror an employee expense as a salary withdrawal (create / update / remove)
 * so the employee's balance always matches what was paid out of the till.
 */
const syncWithdrawal = async (expense, date) => {
  if (!expense.employee) {
    if (expense.withdrawal) {
      await EmployeeWithdrawal.deleteOne({ _id: expense.withdrawal });
      expense.withdrawal = null;
    }
    return;
  }

  const existing = expense.withdrawal
    ? await EmployeeWithdrawal.findById(expense.withdrawal)
    : null;

  if (existing) {
    existing.employee = expense.employee;
    existing.amount = expense.amount;
    await existing.save();
  } else {
    const created = await EmployeeWithdrawal.create({
      employee: expense.employee,
      amount: expense.amount,
      date,
      type: "advance",
      note: "Paid from expenses",
      expense: expense._id,
    });
    expense.withdrawal = created._id;
  }
};

// POST /api/expenses  { categoryId | employeeId, amount, date? }
const addExpenseRecord = async (req, res, next) => {
  try {
    const input = await resolveExpenseInput(req.body);

    // Employee advances are always their own record, linked 1:1 to a withdrawal
    if (input.employee) {
      const expense = new Expenses(input);
      await syncWithdrawal(expense, readDate(req.body.date));
      try {
        await expense.save();
      } catch (err) {
        await EmployeeWithdrawal.deleteOne({ _id: expense.withdrawal });
        throw err;
      }
      return res.status(201).json({
        success: true,
        message: "Employee advance recorded and deducted from salary",
        data: expense,
      });
    }

    // Same category on the same day adds to the existing record
    const dateRange = getDateRange(req.body.date) || getDateRange();

    const existingRecord = await Expenses.findOne({
      ...(input.category
        ? { category: input.category }
        : { description: input.description, category: null }),
      employee: null,
      createdAt: dateRange,
    });

    if (existingRecord) {
      existingRecord.amount = round2(existingRecord.amount + input.amount);
      existingRecord.description = input.description;
      existingRecord.descriptionSi = input.descriptionSi;
      await existingRecord.save();

      return res.status(200).json({
        success: true,
        message: "Amount updated for existing record",
        data: existingRecord,
      });
    }

    const newRecord = await Expenses.create(input);
    res.status(201).json({
      success: true,
      message: "Record created successfully",
      data: newRecord,
    });
  } catch (error) {
    next(error);
  }
};

// get the expense records (defaults to current day)
const getExpenseRecords = async (req, res, next) => {
  try {
    const filter = {};
    const dateRange = getDateRange(req.query.date);
    if (dateRange) {
      filter.createdAt = dateRange;
    }

    const records = await Expenses.find(filter).sort({ createdAt: 1 });
    res.status(200).json({
      success: true,
      message: "Records retrieved successfully",
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/expenses/employees — active staff names for the "Employee Advance"
// picker. Names only: salary details stay admin-only.
const getExpenseEmployees = async (req, res, next) => {
  try {
    const employees = await Employee.find({ isActive: true }, "name")
      .sort({ name: 1 })
      .lean();
    res.status(200).json({ success: true, data: employees });
  } catch (error) {
    next(error);
  }
};

// PUT /api/expenses/:id  { data: { categoryId | employeeId, amount, date? } }
const updateExpenseRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    ensureObjectId(id, "Record");
    const body = req.body.data || req.body;

    const expense = await Expenses.findById(id);
    if (!expense) throw createHttpError(404, "Expense record not found.");

    const input = await resolveExpenseInput(body, expense.employee);
    Object.assign(expense, input);
    await syncWithdrawal(expense, readDate(body.date));
    await expense.save();

    res.status(200).json({
      success: true,
      message: "Expense record updated successfully.",
      data: expense,
    });
  } catch (error) {
    next(error);
  }
};

// delete the expense record (and the salary deduction it created, if any)
const deleteExpenseRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    ensureObjectId(id, "Record");

    const deleteRecord = await Expenses.findByIdAndDelete(id);
    if (!deleteRecord) throw createHttpError(404, "Expense record not found!");

    if (deleteRecord.withdrawal) {
      await EmployeeWithdrawal.deleteOne({ _id: deleteRecord.withdrawal });
    }

    res.status(200).json({
      success: true,
      message: "Expense record deleted successfully",
      data: deleteRecord,
    });
  } catch (error) {
    next(error);
  }
};

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// search the expense record
const searchByExpensesRecord = async (req, res, next) => {
  try {
    const { query, date } = req.query;

    if (!query || query.trim() === "") {
      return next(createHttpError(400, "Search query is required!"));
    }

    const trimmedQuery = query.trim();
    let filter = {};

    if (!isNaN(trimmedQuery)) {
      filter = { amount: Number(trimmedQuery) };
    } else {
      // English or Sinhala label, case-insensitive
      const regex = new RegExp(escapeRegex(trimmedQuery), "i");
      filter = { $or: [{ description: regex }, { descriptionSi: regex }] };
    }

    const dateRange = getDateRange(date);
    if (dateRange) {
      filter.createdAt = dateRange;
    }

    const records = await Expenses.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Search results",
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

//get total expenses for time period
const getTotalExpenses = async (req, res, next) => {
  try {
    const { period } = req.body;
    let startDate, endDate;

    const now = new Date();

    if (period === "today") {
      startDate = new Date(now.setHours(0, 0, 0, 0));
      endDate = new Date(now.setHours(23, 59, 59, 999));
    } else if (period === "week") {
      const day = now.getDay(); // 0 (Sun) to 6 (Sat)
      const diffToMonday = day === 0 ? -6 : 1 - day; // start from Monday
      startDate = new Date(now);
      startDate.setDate(now.getDate() + diffToMonday);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else {
      throw createHttpError(
        400,
        "Invalid range parameter. Use 'today' or 'week'."
      );
    }

    const totalExpenses = await Expenses.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$amount" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      period,
      totalExpenses: totalExpenses[0]?.total || 0,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addExpenseRecord,
  getExpenseRecords,
  getExpenseEmployees,
  updateExpenseRecord,
  deleteExpenseRecord,
  searchByExpensesRecord,
  getTotalExpenses,
};
