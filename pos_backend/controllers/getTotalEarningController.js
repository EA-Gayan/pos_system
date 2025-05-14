const Order = require("../models/orderModel");
const createHttpError = require("http-errors");

const getTotalEarnings = async (req, res, next) => {
  try {
    const { period } = req.body;
    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case "today":
        startDate = new Date(now);
        startDate.setHours(0, 0, 0, 0);
        endDate = now;

        // Get today's earnings
        const [todayResult] = await Order.aggregate([
          {
            $match: {
              createdAt: { $gte: startDate, $lte: endDate },
            },
          },
          {
            $group: {
              _id: null,
              totalEarnings: { $sum: "$bills.totalPayable" },
            },
          },
        ]);

        const todayTotal = todayResult?.totalEarnings || 0;

        // Get yesterday's earnings
        const yesterdayStart = new Date(startDate);
        yesterdayStart.setDate(yesterdayStart.getDate() - 1);

        const yesterdayEnd = new Date(startDate);
        yesterdayEnd.setMilliseconds(-1); // One ms before today starts

        const [yesterdayResult] = await Order.aggregate([
          {
            $match: {
              createdAt: { $gte: yesterdayStart, $lte: yesterdayEnd },
            },
          },
          {
            $group: {
              _id: null,
              totalEarnings: { $sum: "$bills.totalPayable" },
            },
          },
        ]);

        const yesterdayTotal = yesterdayResult?.totalEarnings || 0;

        // Calculate percentage change
        let percentChange = 0;
        if (yesterdayTotal > 0) {
          percentChange =
            ((todayTotal - yesterdayTotal) / yesterdayTotal) * 100;
        }

        return res.status(200).json({
          success: true,
          message: "Today's earnings retrieved",
          totalEarnings: todayTotal,
          percentChange: parseFloat(percentChange.toFixed(2)),
        });

      case "yesterday":
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 1);
        startDate.setHours(0, 0, 0, 0);

        endDate = new Date(startDate);
        endDate.setHours(23, 59, 59, 999);
        break;

      case "week":
        const firstDayOfWeek = now.getDate() - now.getDay();
        startDate = new Date(now);
        startDate.setDate(firstDayOfWeek);
        startDate.setHours(0, 0, 0, 0);

        endDate = now;
        break;

      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        startDate.setHours(0, 0, 0, 0);

        endDate = now;
        break;

      default:
        return next(
          createHttpError(
            400,
            "Invalid period. Use one of: today, yesterday, week, year."
          )
        );
    }

    const [result] = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: null,
          totalEarnings: { $sum: "$bills.totalPayable" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      message: `${period} earnings retrieved`,
      totalEarnings: result?.totalEarnings || 0,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getTotalEarnings };
