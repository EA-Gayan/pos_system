const connectDB = require("../config/database");
const Expense = require("../models/expensesModel");

module.exports = async function expenseCleanupService() {
  await connectDB();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const result = await Expense.deleteMany({
    createdAt: { $lt: startOfToday },
  });

  console.log("[EXPENSE CLEANUP] Deleted:", result.deletedCount);
};
