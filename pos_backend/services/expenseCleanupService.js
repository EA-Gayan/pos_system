const Expense = require("../models/expensesModel");

module.exports = async function expenseCleanupService() {
  try {
    console.log("[Expense CLEANUP] Job started at", new Date().toISOString());

    // Delete records older than 1 week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    oneWeekAgo.setHours(0, 0, 0, 0);

    const result = await Expense.deleteMany({
      createdAt: { $lt: oneWeekAgo },
    });

    console.log(
      `[Expense CLEANUP] Deleted ${result.deletedCount
      } expenses older than 1 week at ${new Date().toISOString()}`
    );

    return result.deletedCount;
  } catch (error) {
    console.error("[Expense CLEANUP ERROR]", error);
    throw error;
  }
};
