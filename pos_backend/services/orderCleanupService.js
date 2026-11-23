const Order = require("../models/orderModel");

module.exports = async function orderCleanupService() {
  try {
    console.log("[ORDER CLEANUP] Job started at", new Date().toISOString());

    // Keep only the current calendar month (e.g. Nov 1 – Dec 1).
    // When a new month starts, everything before its 1st is deleted.
    const now = new Date();
    const cutoffDate = new Date(now.getFullYear(), now.getMonth(), 1);

    console.log(`[ORDER CLEANUP] Deleting records created before ${cutoffDate.toISOString()}`);

    const result = await Order.deleteMany({
      createdAt: { $lt: cutoffDate },
    });

    console.log(
      `[ORDER CLEANUP] Deleted ${result.deletedCount
      } orders from before this month (${cutoffDate.toISOString()}) at ${new Date().toISOString()}`
    );

    return result.deletedCount;
  } catch (error) {
    console.error("[ORDER CLEANUP ERROR]", error);
    throw error;
  }
};
