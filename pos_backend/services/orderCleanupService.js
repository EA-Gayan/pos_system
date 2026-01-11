const Order = require("../models/orderModel");

module.exports = async function orderCleanupService() {
  try {
    console.log("[ORDER CLEANUP] Job started at", new Date().toISOString());

    // Calculate start of the current week (Sunday)
    const now = new Date();
    const dayOfWeek = now.getDay(); // 0 (Sunday) to 6 (Saturday)
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);

    console.log(`[ORDER CLEANUP] Deleting records created before ${startOfWeek.toISOString()}`);

    const result = await Order.deleteMany({
      createdAt: { $lt: startOfWeek },
    });

    console.log(
      `[ORDER CLEANUP] Deleted ${result.deletedCount
      } orders older than start of week (${startOfWeek.toISOString()}) at ${new Date().toISOString()}`
    );

    return result.deletedCount;
  } catch (error) {
    console.error("[ORDER CLEANUP ERROR]", error);
    throw error;
  }
};
