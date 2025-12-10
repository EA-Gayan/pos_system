// api/cleanup-orders.js
import connectDB from "../config/database.js";
import Order from "../models/orderModel.js";

export default async function handler(req, res) {
  // Security: Verify it's actually Vercel's cron calling this
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    await connectDB();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const result = await Order.deleteMany({
      createdAt: { $lt: sevenDaysAgo },
    });

    const message = `Successfully deleted ${result.deletedCount} orders older than 7 days`;
    console.log(`[${new Date().toISOString()}] ${message}`);

    return res.status(200).json({
      success: true,
      deletedCount: result.deletedCount,
      message,
      executedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in order cleanup job:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
