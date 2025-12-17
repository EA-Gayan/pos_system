const express = require("express");
const router = express.Router();
const connectDB = require("../config/database");
const expense = require("../models/expensesModel");
const order = require("../models/orderModel");

// Middleware to verify cron requests
const verifyCronSecret = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({
      success: false,
      error: "Unauthorized - Invalid cron secret",
    });
  }

  next();
};

// Expense cleanup endpoint
router.get("/expense-cleanup", verifyCronSecret, async (req, res) => {
  try {
    await connectDB();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

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
    console.error("Error in expense cleanup job:", error);
    return res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// Order cleanup endpoint
router.get("/order-cleanup", verifyCronSecret, async (req, res) => {
  try {
    await connectDB();

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const result = await order.deleteMany({
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
});

module.exports = router;
