const connectDB = require("../config/database");
const Order = require("../models/orderModel");

module.exports = async function orderCleanupService() {
  console.log("[ORDER CLEANUP] Job started at", new Date().toISOString());

  await connectDB();

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  const result = await Order.deleteMany({
    createdAt: { $lt: startOfToday },
  });

  console.log(
    `[ORDER CLEANUP] Deleted ${
      result.deletedCount
    } orders at ${new Date().toISOString()}`
  );

  return result.deletedCount;
};
