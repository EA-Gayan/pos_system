const cron = require("node-cron");
const expense = require("../models/expensesModel");

// Schedule: Runs every minute (change to "0 0 * * *" for daily at midnight)
cron.schedule("* * * * *", async () => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get the most recent expense by creation date
    const newestExpense = await expense.findOne().sort({ createdAt: -1 });

    if (newestExpense && newestExpense.createdAt < sevenDaysAgo) {
      const result = await expense.deleteMany({});
      console.log(
        `[${new Date().toISOString()}] Deleted ALL ${
          result.deletedCount
        } expenses (all older than 7 days).`
      );
    } else {
      console.log(
        `[${new Date().toISOString()}] Not deleting — some expenses are newer than 7 days.`
      );
    }
  } catch (err) {
    console.error("Error deleting expenses:", err);
  }
});
