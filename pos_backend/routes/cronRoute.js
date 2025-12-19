const express = require("express");
const router = express.Router();

const connectDB = require("../config/database");
const expense = require("../models/expensesModel");
const order = require("../models/orderModel"); // adjust path if needed

/* ---------- EXPENSE CLEANUP ---------- */
router.post("/expenseCleanUpService", async (req, res) => {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    await connectDB();

    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    const result = await expense.deleteMany({
      createdAt: { $lt: startOfToday },
    });

    return res.status(200).json({
      success: true,
      deletedCount: result.deletedCount,
      job: "expenseCleanup",
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

/* ---------- ORDER CLEANUP ---------- */
router.post("/orderCleanupService", async (req, res) => {
  if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    await connectDB();

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 30); // example: delete orders older than 30 days

    const result = await order.deleteMany({
      createdAt: { $lt: cutoffDate },
    });

    return res.status(200).json({
      success: true,
      deletedCount: result.deletedCount,
      job: "orderCleanup",
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
