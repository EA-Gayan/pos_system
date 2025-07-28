const Order = require("../models/orderModel");
const generateIncomeReport = require("../services/generateIncomeReport");

const generateTodayOrderExcel = async (req, res, next) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const orders = await Order.find({
      orderDate: { $gte: startOfDay, $lte: endOfDay },
    }).populate("items.product");

        if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No orders found for today",
      });
    }

    const fileName = "today_orders_report.xlsx";

    let grandTotal = 0;
    const productSummary = {};

    for (const order of orders) {
      for (const item of order.items) {
        const productName = item.name;
        const quantity = item.quantity;
        const total = item.price * quantity;

        if (!productSummary[productName]) {
          productSummary[productName] = {
            qty: 0,
            income: 0,
          };
        }

        productSummary[productName].qty += quantity;
        productSummary[productName].income += total;

        grandTotal += total;
      }
    }

    await generateIncomeReport(
      "Today Orders",
      fileName,
      productSummary,
      grandTotal
    );

    res.status(200).json({
      success: true,
      message: "Report generated successfully",
      fileUrl: `/reports/${fileName}`,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  generateTodayOrderExcel,
};
