import connectDB from "../../config/database.js";
import expense from "../../models/expensesModel.js";

export const config = {
  maxDuration: 10, // Set based on your plan
};

export default async function handler(req, res) {
  // Only allow POST requests from Vercel Cron
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Auth check
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    console.warn(
      `[EXPENSE CLEANUP] Unauthorized access attempt at ${new Date().toISOString()}`
    );
    return res.status(401).json({ error: "Unauthorized" });
  }

  let connectionEstablished = false;

  try {
    console.log(`[EXPENSE CLEANUP] Job started at ${new Date().toISOString()}`);

    // Set a timeout for database operations
    const dbTimeout = setTimeout(() => {
      throw new Error("Database operation timeout");
    }, 50000); // 50 seconds (leave buffer for Vercel timeout)

    await connectDB();
    connectionEstablished = true;

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const result = await expense.deleteMany({
      createdAt: { $lt: startOfToday },
    });

    clearTimeout(dbTimeout);

    console.log(
      `[EXPENSE CLEANUP] Successfully deleted ${
        result.deletedCount
      } expenses | Executed at ${new Date().toISOString()}`
    );

    return res.status(200).json({
      success: true,
      deletedCount: result.deletedCount,
      executedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error(
      `[EXPENSE CLEANUP] Job failed at ${new Date().toISOString()}`,
      err
    );

    return res.status(500).json({
      error: err.message,
      connectionEstablished,
    });
  }
}
