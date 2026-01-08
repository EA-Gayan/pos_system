const expenseCleanup = require("./expenseCleanupService");
const orderCleanup = require("./orderCleanupService");

module.exports = async function incomeCleanup() {
  try {
    console.log("[CLEANUP] Running income cleanup");

    // Run cleanup services in parallel for better performance
    const [expenseCount, orderCount] = await Promise.all([
      expenseCleanup(),
      orderCleanup(),
    ]);

    console.log(
      `[CLEANUP] Completed - Deleted ${expenseCount} expenses and ${orderCount} orders older than 1 week`
    );

    return { expenseCount, orderCount };
  } catch (error) {
    console.error("[CLEANUP ERROR]", error);
    throw error;
  }
};
