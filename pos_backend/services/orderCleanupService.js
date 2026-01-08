const Order = require("../models/orderModel");

module.exports = async function orderCleanupService() {
  try {
    console.log("[ORDER CLEANUP] Job started at", new Date().toISOString());

    // Delete records older than 1 week
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    oneWeekAgo.setHours(0, 0, 0, 0);

    const result = await Order.deleteMany({
      createdAt: { $lt: oneWeekAgo },
    });

    console.log(
      `[ORDER CLEANUP] Deleted ${result.deletedCount
      } orders older than 1 week at ${new Date().toISOString()}`
    );

    return result.deletedCount;
  } catch (error) {
    console.error("[ORDER CLEANUP ERROR]", error);
    throw error;
  }
};
