const Expense = require("../models/expensesModel");

module.exports = async function expenseCleanupService() {
  try {
    console.log("[Expense CLEANUP] Job started at", new Date().toISOString());

    // Keep only the current calendar month (e.g. Nov 1 – Dec 1).
    // When a new month starts, everything before its 1st is deleted.
    const now = new Date();
    const cutoffDate = new Date(now.getFullYear(), now.getMonth(), 1);

    const result = await Expense.deleteMany({
      createdAt: { $lt: cutoffDate },
    });

    console.log(
      `[Expense CLEANUP] Deleted ${result.deletedCount
      } expenses from before this month at ${new Date().toISOString()}`
    );

    return result.deletedCount;
  } catch (error) {
    console.error("[Expense CLEANUP ERROR]", error);
    throw error;
  }
};
