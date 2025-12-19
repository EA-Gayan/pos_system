const connectDB = require("../config/database");
const Expense = require("../models/expensesModel");

module.exports = async function expenseCleanupService() {
  console.log("[Expense CLEANUP] Job started at", new Date().toISOString());

  await connectDB();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const result = await Expense.deleteMany({
    createdAt: { $lt: startOfToday },
  });

  console.log(
    `[Expense CLEANUP] Deleted ${
      result.deletedCount
    } orders at ${new Date().toISOString()}`
  );

  return result.deletedCount;
};
