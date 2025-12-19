const app = require("./app");

module.exports = async (req, res) => {
  try {
    const isCron =
      req.headers["x-vercel-cron"] === "1" ||
      req.headers["x-vercel-cron"] === "true";

    if (isCron) {
      console.log("[CRON] Triggered at", new Date().toISOString());

      // 🔽 CALL YOUR CRON SERVICES HERE
      const expenseCleanup = require("./services/expenseCleanupService");
      const orderCleanup = require("./services/orderCleanupService");

      await expenseCleanup();
      await orderCleanup();

      return res.status(200).json({ success: true });
    }

    // Normal API traffic
    return app(req, res);
  } catch (err) {
    console.error("[INDEX ERROR]", err);
    return res.status(500).json({ error: err.message });
  }
};
