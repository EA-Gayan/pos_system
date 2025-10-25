import connectDB from "../config/database.js";
import expense from "../models/expensesModel.js";

export default async function handler(req, res) {
  try {
    await connectDB();

    // Calculate date 7 days ago
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Delete only expenses older than 7 days
    const result = await expense.deleteMany({
      createdAt: { $lt: sevenDaysAgo },
    });

    const message = `Successfully deleted ${result.deletedCount} expenses older than 7 days`;
    console.log(`[${new Date().toISOString()}] ${message}`);

    return res.status(200).json({
      success: true,
      deletedCount: result.deletedCount,
      message,
      executedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error in cleanup job:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
}
