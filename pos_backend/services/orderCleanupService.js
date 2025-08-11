const cron = require("node-cron");
const Order = require("../models/orderModel");

// Schedule: Runs every minute (change to "0 0 * * *" for daily at midnight)
cron.schedule("* * * * *", async () => {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Check if all orders are older than 7 days
    const newestOrder = await Order.findOne().sort({ orderDate: -1 });

    if (newestOrder && newestOrder.orderDate < sevenDaysAgo) {
      const result = await Order.deleteMany({});
      console.log(
        `[${new Date().toISOString()}] Deleted ALL ${
          result.deletedCount
        } orders (all older than 7 days).`
      );
    } else {
      console.log(
        `[${new Date().toISOString()}] Not deleting — some orders are newer than 7 days.`
      );
    }
  } catch (err) {
    console.error("Error deleting orders:", err);
  }
});
