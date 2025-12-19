import connectDB from "../../config/database.js";
import Order from "../../models/orderModel.js";

/**
 * Vercel cron configuration
 */
export const config = {
  runtime: "nodejs",
  maxDuration: 60, // seconds
};

export default async function handler(req, res) {
  /* ---- METHOD CHECK ---- */
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  /* ---- AUTH CHECK ---- */
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn(
      `[ORDER CLEANUP] Unauthorized access at ${new Date().toISOString()}`
    );
    return res.status(401).json({ error: "Unauthorized" });
  }

  let connectionEstablished = false;

  try {
    console.log(`[ORDER CLEANUP] Job started at ${new Date().toISOString()}`);

    await connectDB();
    connectionEstablished = true;

    // Example: delete orders older than 30 days
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30);

    const result = await Order.deleteMany({
      createdAt: { $lt: cutoffDate },
    });

    console.log(`[ORDER CLEANUP] Deleted ${result.deletedCount} orders`);

    return res.status(200).json({
      success: true,
      deletedCount: result.deletedCount,
      executedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error(
      `[ORDER CLEANUP] Job failed at ${new Date().toISOString()}`,
      err
    );

    return res.status(500).json({
      error: err.message,
      connectionEstablished,
    });
  }
}
