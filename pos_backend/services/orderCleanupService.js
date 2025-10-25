// api/cleanup-orders.js
import connectDB from "../config/database.js";
import Order from "../models/orderModel.js";

export default async function handler(req, res) {
  // Security: Verify the request is from Vercel Cron
  const authHeader = req.headers.authorization;
  const cronSecret = process.env.CRON_SECRET;

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Connect to database
    await connectDB();

    // Calculate date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Delete only orders older than 7 days (keeping newer ones)
    const result = await Order.deleteMany({
      orderDate: { $lt: sevenDaysAgo },
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
    console.error("Error deleting old orders:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
