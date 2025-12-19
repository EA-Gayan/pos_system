import connectDB from "../../../config/database.js";
import order from "../../../models/orderModel.js";

export default async function handler(req, res) {
  // Auth check
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn(
      `[ORDER CLEANUP] Unauthorized access attempt at ${new Date().toISOString()}`
    );
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    console.log(`[ORDER CLEANUP] Job started at ${new Date().toISOString()}`);

    await connectDB();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const result = await order.deleteMany({
      createdAt: { $lt: startOfToday },
    });

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

    return res.status(500).json({ error: err.message });
  }
}
