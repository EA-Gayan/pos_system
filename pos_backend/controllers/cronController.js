const incomeCleanup = require("../services/incomeCleanup");

exports.cleanup = async (req, res) => {
    try {
        // Verify authorization header to prevent unauthorized access
        const authHeader = req.headers.authorization;
        const expectedAuth = `Bearer ${process.env.CRON_SECRET || "your-secret-key"
            }`;

        if (authHeader !== expectedAuth) {
            console.error("[CRON] Unauthorized access attempt");
            return res.status(401).json({
                success: false,
                error: "Unauthorized",
            });
        }

        console.log("[CRON] Starting cleanup job");
        const result = await incomeCleanup();

        console.log("[CRON] Cleanup job completed successfully");
        return res.status(200).json({
            success: true,
            message: "Cleanup completed successfully",
            result,
        });
    } catch (error) {
        console.error("[CRON ERROR]", error);
        return res.status(500).json({
            success: false,
            error: error.message,
        });
    }
};
