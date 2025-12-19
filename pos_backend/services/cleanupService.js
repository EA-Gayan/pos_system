const connectDB = require("../config/database");
const Expense = require("../models/expensesModel");
const Order = require("../models/orderModel");

let connected = false;

async function ensureDB() {
  if (!connected) {
    await connectDB();
    connected = true;
  }
}

async function runExpenseCleanup() {
  await ensureDB();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const result = await Expense.deleteMany({
    createdAt: { $lt: startOfToday },
  });

  console.log("[CRON] Expense deleted:", result.deletedCount);
}

async function runOrderCleanup() {
  await ensureDB();

  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 30);

  const result = await Order.deleteMany({
    createdAt: { $lt: cutoffDate },
  });

  console.log("[CRON] Orders deleted:", result.deletedCount);
}

module.exports = {
  runExpenseCleanup,
  runOrderCleanup,
};
