const mongoose = require("mongoose");
const createHttpError = require("http-errors");
const Employee = require("../models/employeeModel");
const EmployeeAttendance = require("../models/employeeAttendanceModel");
const EmployeeWithdrawal = require("../models/employeeWithdrawalModel");
const EmployeePositions = require("../enum/employeePositions");

const POSITION_VALUES = Object.values(EmployeePositions);

/* ------------------------------------------------------------------ */
/* Date helpers — all dates are local calendar days as "YYYY-MM-DD".   */
/* Plain strings avoid UTC/local drift (the server may run in UTC      */
/* while the restaurant is not), and they compare correctly as text.   */
/* ------------------------------------------------------------------ */

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const MONTH_RE = /^\d{4}-\d{2}$/;
const DAY_MS = 24 * 60 * 60 * 1000;

const pad = (n) => String(n).padStart(2, "0");

const isValidDate = (s) => {
  if (typeof s !== "string" || !DATE_RE.test(s)) return false;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  return (
    dt.getUTCFullYear() === y && dt.getUTCMonth() === m - 1 && dt.getUTCDate() === d
  );
};

const serverToday = () => {
  const now = new Date();
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
};

const toUTC = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};

// Number of calendar days from a to b, both inclusive (0 if b < a)
const daysInclusive = (a, b) =>
  b < a ? 0 : Math.round((toUTC(b) - toUTC(a)) / DAY_MS) + 1;

const maxDate = (...dates) => dates.filter(Boolean).sort().pop();
const minDate = (...dates) => dates.filter(Boolean).sort()[0];

const monthBounds = (month) => {
  const [y, m] = month.split("-").map(Number);
  const lastDay = new Date(Date.UTC(y, m, 0)).getUTCDate();
  return { start: `${month}-01`, end: `${month}-${pad(lastDay)}` };
};

const round2 = (n) => Math.round(n * 100) / 100;

// Read ?month=YYYY-MM and ?asOf=YYYY-MM-DD. The client sends its own local
// "today" as asOf so salary is never accrued for a day that hasn't started yet.
const readPeriod = (query) => {
  const asOf = isValidDate(query.asOf) ? query.asOf : serverToday();
  const month = MONTH_RE.test(query.month || "") ? query.month : asOf.slice(0, 7);
  return { asOf, month, ...monthBounds(month) };
};

/* ------------------------------------------------------------------ */
/* Salary calculation                                                  */
/* ------------------------------------------------------------------ */

const addDays = (dateStr, n) => {
  const d = new Date(toUTC(dateStr) + n * DAY_MS);
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
};

/**
 * The employee's rates sorted by effectiveFrom. Profiles created before
 * salary history existed fall back to a single rate from the join date.
 */
const getRateSchedule = (employee) => {
  const history = (employee.salaryHistory || [])
    .map((h) => ({ _id: h._id, dailySalary: h.dailySalary, effectiveFrom: h.effectiveFrom }))
    .sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom));
  return history.length
    ? history
    : [{ dailySalary: employee.dailySalary, effectiveFrom: employee.joinDate }];
};

// Rate in effect on a day (days before the first entry use the first rate)
const rateOn = (schedule, date) => {
  let rate = schedule[0].dailySalary;
  for (const s of schedule) {
    if (s.effectiveFrom <= date) rate = s.dailySalary;
    else break;
  }
  return rate;
};

/**
 * Salary summary for one employee over [rangeStart, rangeEnd].
 * Every day between join date and today counts as a working day unless
 * marked "leave" (0 days) or "half-day" (0.5 days). Each day is paid at the
 * rate in effect on that day, so salary changes only affect later days.
 */
const summarize = (employee, attendance, withdrawals, rangeStart, rangeEnd, asOf) => {
  const from = maxDate(rangeStart, employee.joinDate);
  const to = minDate(rangeEnd, asOf, employee.endDate);
  const schedule = getRateSchedule(employee);

  let calendarDays = 0;
  let leaveDays = 0;
  let halfDays = 0;
  let workingDays = 0;
  let earned = 0;
  const rateBreakdown = [];

  // Split [from, to] into segments that share one rate
  schedule.forEach((entry, i) => {
    const segFrom = i === 0 ? from : maxDate(from, entry.effectiveFrom);
    const next = schedule[i + 1];
    const segTo = next ? minDate(to, addDays(next.effectiveFrom, -1)) : to;
    const days = daysInclusive(segFrom, segTo);
    if (days <= 0) return;

    let leave = 0;
    let half = 0;
    for (const rec of attendance) {
      if (rec.date < segFrom || rec.date > segTo) continue;
      if (rec.status === "leave") leave += 1;
      else if (rec.status === "half-day") half += 1;
    }
    const worked = Math.max(0, days - leave - half * 0.5);
    const segEarned = round2(worked * entry.dailySalary);

    calendarDays += days;
    leaveDays += leave;
    halfDays += half;
    workingDays += worked;
    earned += segEarned;
    rateBreakdown.push({
      from: segFrom,
      to: segTo,
      dailySalary: entry.dailySalary,
      workingDays: worked,
      earned: segEarned,
    });
  });

  earned = round2(earned);

  let withdrawn = 0;
  for (const w of withdrawals) {
    if (w.date >= rangeStart && w.date <= rangeEnd) withdrawn += w.amount;
  }
  withdrawn = round2(withdrawn);

  return {
    calendarDays,
    leaveDays,
    halfDays,
    workingDays,
    earned,
    withdrawn,
    balance: round2(earned - withdrawn),
    rateBreakdown,
  };
};

const groupByEmployee = (records) => {
  const map = new Map();
  for (const r of records) {
    const key = r.employee.toString();
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(r);
  }
  return map;
};

const buildEmployeeSummary = (employee, attendance, withdrawals, period) => {
  const todayRecord = attendance.find((a) => a.date === period.asOf);
  const schedule = getRateSchedule(employee);
  return {
    ...employee,
    salaryHistory: schedule,
    // Rate paid today — may differ from dailySalary when a raise is scheduled ahead
    currentDailySalary: rateOn(schedule, period.asOf),
    todayStatus: todayRecord ? todayRecord.status : "present",
    monthSummary: summarize(
      employee, attendance, withdrawals, period.start, period.end, period.asOf
    ),
    overallSummary: summarize(
      employee, attendance, withdrawals, employee.joinDate, period.asOf, period.asOf
    ),
  };
};

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

const ensureObjectId = (id, label = "Employee") => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw createHttpError(400, `Invalid ${label} ID!`);
  }
};

const EDITABLE_FIELDS = [
  "name", "position", "customPosition", "phone", "nic", "address",
  "emergencyContact", "joinDate", "dailySalary", "isActive", "endDate", "notes",
];

const pickEmployeeFields = (body = {}) => {
  const data = {};
  for (const key of EDITABLE_FIELDS) {
    if (body[key] !== undefined) data[key] = body[key];
  }
  if (typeof data.name === "string") data.name = data.name.trim();
  if (data.position !== undefined) data.position = Number(data.position);
  if (typeof data.customPosition === "string") data.customPosition = data.customPosition.trim();
  if (data.dailySalary !== undefined) data.dailySalary = Number(data.dailySalary);
  if (data.endDate === "") data.endDate = null;
  return data;
};

const validateEmployee = (data, { partial = false } = {}) => {
  if (!partial || data.name !== undefined) {
    if (!data.name) throw createHttpError(400, "Employee name is required!");
  }
  if (!partial || data.position !== undefined) {
    if (!POSITION_VALUES.includes(data.position)) {
      throw createHttpError(400, "Please select a valid position!");
    }
  }
  if (!partial || data.joinDate !== undefined) {
    if (!isValidDate(data.joinDate)) throw createHttpError(400, "A valid join date is required!");
  }
  if (!partial || data.dailySalary !== undefined) {
    if (!Number.isFinite(data.dailySalary) || data.dailySalary < 0) {
      throw createHttpError(400, "Day salary must be a positive number!");
    }
  }
  if (data.endDate && !isValidDate(data.endDate)) {
    throw createHttpError(400, "Invalid last working day!");
  }
};

// Custom role text only belongs to OTHER — drop stale text for any other position
const normalizePosition = (doc) => {
  if (doc.position !== EmployeePositions.OTHER) doc.customPosition = "";
  else if (!doc.customPosition) {
    throw createHttpError(400, "Enter the role name for 'Other'!");
  }
};

/* ------------------------------------------------------------------ */
/* Employee CRUD                                                       */
/* ------------------------------------------------------------------ */

// GET /api/employee?month=YYYY-MM&asOf=YYYY-MM-DD
const getEmployees = async (req, res, next) => {
  try {
    const period = readPeriod(req.query);

    const [employees, attendance, withdrawals] = await Promise.all([
      Employee.find().sort({ isActive: -1, name: 1 }).lean(),
      EmployeeAttendance.find({}, "employee date status").lean(),
      EmployeeWithdrawal.find({}, "employee date amount").lean(),
    ]);

    const attByEmp = groupByEmployee(attendance);
    const wdByEmp = groupByEmployee(withdrawals);

    const data = employees.map((emp) => {
      const id = emp._id.toString();
      return buildEmployeeSummary(
        emp, attByEmp.get(id) || [], wdByEmp.get(id) || [], period
      );
    });

    const active = data.filter((e) => e.isActive);
    const totals = {
      totalEmployees: data.length,
      activeEmployees: active.length,
      onLeaveToday: active.filter((e) => e.todayStatus === "leave").length,
      halfDayToday: active.filter((e) => e.todayStatus === "half-day").length,
      monthEarned: round2(data.reduce((s, e) => s + e.monthSummary.earned, 0)),
      monthWithdrawn: round2(data.reduce((s, e) => s + e.monthSummary.withdrawn, 0)),
      outstandingBalance: round2(data.reduce((s, e) => s + e.overallSummary.balance, 0)),
    };

    res.status(200).json({
      success: true,
      data: { month: period.month, asOf: period.asOf, employees: data, totals },
    });
  } catch (error) {
    next(error);
  }
};

// GET /api/employee/:id?month=YYYY-MM&asOf=YYYY-MM-DD
const getEmployeeDetails = async (req, res, next) => {
  try {
    const { id } = req.params;
    ensureObjectId(id);
    const period = readPeriod(req.query);

    const employee = await Employee.findById(id).lean();
    if (!employee) throw createHttpError(404, "Employee not found!");

    const [attendance, withdrawals] = await Promise.all([
      EmployeeAttendance.find({ employee: id }).sort({ date: 1 }).lean(),
      EmployeeWithdrawal.find({ employee: id }).sort({ date: -1, createdAt: -1 }).lean(),
    ]);

    const summary = buildEmployeeSummary(employee, attendance, withdrawals, period);

    res.status(200).json({
      success: true,
      data: {
        ...summary,
        month: period.month,
        asOf: period.asOf,
        attendance: attendance.filter(
          (a) => a.date >= period.start && a.date <= period.end
        ),
        withdrawals: withdrawals.filter(
          (w) => w.date >= period.start && w.date <= period.end
        ),
      },
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/employee
const addEmployee = async (req, res, next) => {
  try {
    const data = pickEmployeeFields(req.body);
    validateEmployee(data);
    normalizePosition(data);
    if (data.isActive === false && !data.endDate) data.endDate = data.joinDate;
    data.salaryHistory = [{ dailySalary: data.dailySalary, effectiveFrom: data.joinDate }];

    const employee = await Employee.create(data);

    res.status(201).json({
      success: true,
      message: "Employee profile created successfully!",
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// PUT /api/employee/:id
const updateEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    ensureObjectId(id);

    const data = pickEmployeeFields(req.body);
    validateEmployee(data, { partial: true });

    const employee = await Employee.findById(id);
    if (!employee) throw createHttpError(404, "Employee not found!");

    const today = isValidDate(req.body.asOf) ? req.body.asOf : serverToday();
    const oldJoinDate = employee.joinDate;
    let schedule = getRateSchedule(employee); // seeds history for older profiles
    const { dailySalary: newRate, ...profile } = data;

    Object.assign(employee, profile);
    normalizePosition(employee);

    // Moving the join date carries the opening rate along with it
    if (employee.joinDate !== oldJoinDate) {
      schedule = schedule.map((s) =>
        s.effectiveFrom === oldJoinDate ? { ...s, effectiveFrom: employee.joinDate } : s
      );
    }

    // A new rate starts from its effective date; earlier days keep the old rate
    if (newRate !== undefined) {
      const effectiveFrom = req.body.salaryEffectiveFrom || today;
      if (!isValidDate(effectiveFrom)) {
        throw createHttpError(400, "Invalid salary effective date!");
      }
      if (effectiveFrom < employee.joinDate) {
        throw createHttpError(400, "Salary effective date cannot be before the join date!");
      }
      if (rateOn(schedule, effectiveFrom) !== newRate) {
        schedule = schedule.filter((s) => s.effectiveFrom !== effectiveFrom);
        schedule.push({ dailySalary: newRate, effectiveFrom });
      }
    }

    schedule.sort((a, b) => a.effectiveFrom.localeCompare(b.effectiveFrom));
    employee.salaryHistory = schedule;
    employee.dailySalary = schedule[schedule.length - 1].dailySalary;

    // Keep endDate consistent with the active flag
    if (employee.isActive) {
      employee.endDate = null;
    } else if (!employee.endDate) {
      employee.endDate = today;
    }
    if (employee.endDate && employee.endDate < employee.joinDate) {
      throw createHttpError(400, "Last working day cannot be before the join date!");
    }

    await employee.save();

    res.status(200).json({
      success: true,
      message: "Employee profile updated successfully!",
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/employee/:id — also removes the employee's attendance and withdrawals
const deleteEmployee = async (req, res, next) => {
  try {
    const { id } = req.params;
    ensureObjectId(id);

    const employee = await Employee.findByIdAndDelete(id);
    if (!employee) throw createHttpError(404, "Employee not found!");

    await Promise.all([
      EmployeeAttendance.deleteMany({ employee: id }),
      EmployeeWithdrawal.deleteMany({ employee: id }),
    ]);

    res.status(200).json({
      success: true,
      message: "Employee deleted successfully!",
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/employee/:id/salary-history/:entryId — undo a salary change entered by mistake
const deleteSalaryEntry = async (req, res, next) => {
  try {
    const { id, entryId } = req.params;
    ensureObjectId(id);
    ensureObjectId(entryId, "Salary entry");

    const employee = await Employee.findById(id);
    if (!employee) throw createHttpError(404, "Employee not found!");

    const schedule = getRateSchedule(employee);
    const index = schedule.findIndex((s) => s._id?.toString() === entryId);
    if (index === -1) throw createHttpError(404, "Salary entry not found!");
    if (index === 0) {
      throw createHttpError(400, "The starting salary cannot be removed — edit it instead.");
    }

    schedule.splice(index, 1);
    employee.salaryHistory = schedule;
    employee.dailySalary = schedule[schedule.length - 1].dailySalary;
    await employee.save();

    res.status(200).json({
      success: true,
      message: "Salary change removed!",
      data: employee,
    });
  } catch (error) {
    next(error);
  }
};

/* ------------------------------------------------------------------ */
/* Attendance (leave marking)                                          */
/* ------------------------------------------------------------------ */

// PUT /api/employee/:id/attendance  { date, status: "present" | "leave" | "half-day", note? }
const markAttendance = async (req, res, next) => {
  try {
    const { id } = req.params;
    ensureObjectId(id);
    const { date, status, note = "" } = req.body;

    if (!isValidDate(date)) throw createHttpError(400, "A valid date is required!");
    if (!["present", "leave", "half-day"].includes(status)) {
      throw createHttpError(400, "Status must be present, leave or half-day!");
    }

    const employee = await Employee.findById(id).lean();
    if (!employee) throw createHttpError(404, "Employee not found!");
    if (date < employee.joinDate) {
      throw createHttpError(400, "Cannot mark attendance before the join date!");
    }
    if (employee.endDate && date > employee.endDate) {
      throw createHttpError(400, "Cannot mark attendance after the last working day!");
    }

    // "present" is the default — just remove any exception for that day
    if (status === "present") {
      await EmployeeAttendance.deleteOne({ employee: id, date });
      return res.status(200).json({
        success: true,
        message: "Marked as working day",
        data: { employee: id, date, status },
      });
    }

    const record = await EmployeeAttendance.findOneAndUpdate(
      { employee: id, date },
      { status, note },
      { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    res.status(200).json({
      success: true,
      message: status === "leave" ? "Marked as leave" : "Marked as half day",
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

/* ------------------------------------------------------------------ */
/* Withdrawals (salary advances / payouts)                             */
/* ------------------------------------------------------------------ */

// POST /api/employee/:id/withdrawals  { amount, date, type?, note? }
const addWithdrawal = async (req, res, next) => {
  try {
    const { id } = req.params;
    ensureObjectId(id);
    const { date, type = "advance", note = "" } = req.body;
    const amount = Number(req.body.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      throw createHttpError(400, "Amount must be greater than zero!");
    }
    if (!isValidDate(date)) throw createHttpError(400, "A valid date is required!");
    if (!["advance", "salary"].includes(type)) {
      throw createHttpError(400, "Type must be advance or salary!");
    }

    const exists = await Employee.exists({ _id: id });
    if (!exists) throw createHttpError(404, "Employee not found!");

    const record = await EmployeeWithdrawal.create({
      employee: id, amount: round2(amount), date, type, note,
    });

    res.status(201).json({
      success: true,
      message: "Withdrawal recorded successfully!",
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/employee/:id/withdrawals/:withdrawalId
const deleteWithdrawal = async (req, res, next) => {
  try {
    const { id, withdrawalId } = req.params;
    ensureObjectId(id);
    ensureObjectId(withdrawalId, "Withdrawal");

    const record = await EmployeeWithdrawal.findOneAndDelete({
      _id: withdrawalId,
      employee: id,
    });
    if (!record) throw createHttpError(404, "Withdrawal record not found!");

    res.status(200).json({
      success: true,
      message: "Withdrawal deleted successfully!",
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getEmployees,
  getEmployeeDetails,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  deleteSalaryEntry,
  markAttendance,
  addWithdrawal,
  deleteWithdrawal,
};
