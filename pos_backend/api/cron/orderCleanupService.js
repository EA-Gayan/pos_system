import connectDB from "../../config/database.js";
import order from "../../models/orderModel.js";

export const config = {
  maxDuration: 10, // Set based on your Vercel plan (10s for Hobby, 60s for Pro)
};

export default async function handler(req, res) {
  // Only allow POST requests from Vercel Cron
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Auth check
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn(
      `[ORDER CLEANUP] Unauthorized access attempt at ${new Date().toISOString()}`
    );
    return res.status(401).json({ error: "Unauthorized" });
  }

  let connectionEstablished = false;

  try {
    console.log(`[ORDER CLEANUP] Job started at ${new Date().toISOString()}`);

    // Set a timeout for database operations
    const dbTimeout = setTimeout(() => {
      throw new Error("Database operation timeout");
    }, 50000); // 50 seconds (leave buffer for Vercel timeout)

    await connectDB();
    connectionEstablished = true;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const result = await order.deleteMany({
      createdAt: { $lt: startOfToday },
    });

    clearTimeout(dbTimeout);

    console.log(
      `[ORDER CLEANUP] Successfully deleted ${
        result.deletedCount
      } orders | Executed at ${new Date().toISOString()}`
    );

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
