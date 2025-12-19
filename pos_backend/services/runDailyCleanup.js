const CleanupStatus = require("../models/cleanupStatusModel");
const expenseCleanup = require("./expenseCleanupService");
const orderCleanup = require("./orderCleanupService");

module.exports = async function runDailyCleanup() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const status = await CleanupStatus.findOne({ key: "daily-cleanup" });

  if (status && status.lastRunAt >= today) {
    // Already ran today
    return;
  }

  console.log("[CLEANUP] Running daily cleanup");

  await expenseCleanup();
  await orderCleanup();

  await CleanupStatus.findOneAndUpdate(
    { key: "daily-cleanup" },
    { lastRunAt: new Date() },
    { upsert: true }
  );

  console.log("[CLEANUP] Completed");
};
