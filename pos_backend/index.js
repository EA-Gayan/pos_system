const app = require("./app");
const config = require("./config/config");
const {
  runExpenseCleanup,
  runOrderCleanup,
} = require("./services/cleanupService");

const PORT = config.port;

/* Local dev only */
if (process.env.NODE_ENV !== "production") {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

/* Vercel entry */
module.exports = async (req, res) => {
  const isCron =
    req.headers["x-vercel-cron"] === "1" ||
    req.headers["x-vercel-cron"] === "true";

  if (isCron) {
    console.log("[CRON] Triggered");

    // Optional extra security
    if (req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
      return res.status(401).json({ error: "Unauthorized cron" });
    }

    try {
      await runExpenseCleanup();
      await runOrderCleanup();

      return res.status(200).json({
        success: true,
        message: "Cron jobs executed successfully",
      });
    } catch (err) {
      console.error("[CRON] Failed", err);
      return res.status(500).json({ error: err.message });
    }
  }

  // Normal API / frontend request
  return app(req, res);
};
