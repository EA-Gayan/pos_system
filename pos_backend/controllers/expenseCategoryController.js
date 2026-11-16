const mongoose = require("mongoose");
const createHttpError = require("http-errors");
const ExpenseCategory = require("../models/expenseCategoryModel");
const Expenses = require("../models/expensesModel");

const CASE_INSENSITIVE = { locale: "en", strength: 2 };

const readNames = (body = {}) => {
  const nameEn = typeof body.nameEn === "string" ? body.nameEn.trim() : "";
  const nameSi = typeof body.nameSi === "string" ? body.nameSi.trim() : "";
  if (!nameEn) throw createHttpError(400, "English category name is required!");
  if (!nameSi) throw createHttpError(400, "Sinhala category name is required!");
  return { nameEn, nameSi };
};

const ensureUniqueName = async (nameEn, excludeId) => {
  const filter = { nameEn };
  if (excludeId) filter._id = { $ne: excludeId };
  const exists = await ExpenseCategory.findOne(filter).collation(CASE_INSENSITIVE).lean();
  if (exists) throw createHttpError(409, `Category "${nameEn}" already exists!`);
};

const ensureObjectId = (id) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createHttpError(400, "Invalid category ID!");
  }
};

// GET /api/expense-category — any signed-in user (cashier picks from this list)
const getExpenseCategories = async (req, res, next) => {
  try {
    const categories = await ExpenseCategory.find()
      .collation(CASE_INSENSITIVE)
      .sort({ nameEn: 1 })
      .lean();
    res.status(200).json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

// POST /api/expense-category  { nameEn, nameSi } — admin
const addExpenseCategory = async (req, res, next) => {
  try {
    const names = readNames(req.body);
    await ensureUniqueName(names.nameEn);
    const category = await ExpenseCategory.create(names);
    res.status(201).json({
      success: true,
      message: "Expense category added!",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/expense-category/:id  { nameEn, nameSi } — admin
const updateExpenseCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    ensureObjectId(id);
    const names = readNames(req.body);
    await ensureUniqueName(names.nameEn, id);

    const category = await ExpenseCategory.findByIdAndUpdate(id, names, {
      new: true,
      runValidators: true,
    });
    if (!category) throw createHttpError(404, "Expense category not found!");

    // Keep the label snapshots on existing expenses in step with the rename
    await Expenses.updateMany(
      { category: id },
      { description: names.nameEn, descriptionSi: names.nameSi }
    );

    res.status(200).json({
      success: true,
      message: "Expense category updated!",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/expense-category/:id — admin. Past expenses keep their label snapshot.
const deleteExpenseCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    ensureObjectId(id);
    const category = await ExpenseCategory.findByIdAndDelete(id);
    if (!category) throw createHttpError(404, "Expense category not found!");
    res.status(200).json({
      success: true,
      message: "Expense category deleted!",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getExpenseCategories,
  addExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
};
