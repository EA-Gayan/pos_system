const serverless = require("serverless-http");
const app = require("./app");

const handler = serverless(app);

module.exports = async (req, res) => {
  try {
    const isCron =
      req.headers["x-vercel-cron"] === "1" ||
      req.headers["x-vercel-cron"] === "true";

    if (isCron) {
      console.log("[CRON] Triggered at", new Date().toISOString());

      const expenseCleanup = require("./services/expenseCleanupService");
      const orderCleanup = require("./services/orderCleanupService");

      await expenseCleanup();
      await orderCleanup();

      return res.status(200).json({ success: true });
    }

    // ✅ Properly forward to Express
    return handler(req, res);
  } catch (err) {
    console.error("[FUNCTION CRASH]", err);
    return res.status(500).json({ error: err.message });
  }
};
