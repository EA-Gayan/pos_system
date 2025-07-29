const Order = require("../models/orderModel");
const Expenses = require("../models/expensesModel");
const generateExpensesReportService = require("../services/generateExpensesReport");
const generateIncomeReportService = require("../services/generateIncomeReport");

const generateIncomeReport = async (req, res, next) => {
  try {
    const { type } = req.params;

    const now = new Date();
    let startDate, endDate;

    if (type === "week") {
      const day = now.getDay();
      const diffToMonday = (day + 6) % 7;
      startDate = new Date(now);
      startDate.setDate(now.getDate() - diffToMonday);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    }

    const orders = await Order.find({
      orderDate: { $gte: startDate, $lte: endDate },
    }).populate("items.product");

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No orders found for today",
      });
    }

    const fileName =
      type === "week" ? "week_orders_report.xlsx" : "today_orders_report.xlsx";

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

    await generateIncomeReportService(
      type === "week" ? "Week Orders" : "Today Orders",
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

const generateExpensesReport = async (req, res, next) => {
  try {
    const { type } = req.params;

    const now = new Date();
    let startDate, endDate;

    if (type === "week") {
      const day = now.getDay();
      const diffToMonday = (day + 6) % 7;
      startDate = new Date(now);
      startDate.setDate(now.getDate() - diffToMonday);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    } else {
      startDate = new Date();
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date();
      endDate.setHours(23, 59, 59, 999);
    }

    const expenses = await Expenses.find({
      createdAt: { $gte: startDate, $lte: endDate },
    });

    if (expenses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No expenses found for today",
      });
    }

    const fileName =
      type === "week"
        ? "week_expenses_report.xlsx"
        : "today_expenses_report.xlsx";

    let grandTotal = 0;
    const expensesSummary = {};

    for (const ex of expenses) {
      const description = ex.description;
      const price = ex.amount;

      if (!expensesSummary[description]) {
        expensesSummary[description] = {
          total: 0,
        };
      }

      expensesSummary[description].total += price;

      grandTotal += price;
    }

    await generateExpensesReportService(
      type === "week" ? "Week Expenses" : "Today Expenses",
      fileName,
      expensesSummary,
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
  generateIncomeReport,
  generateExpensesReport,
};
