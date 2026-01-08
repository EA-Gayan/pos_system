const Order = require("../models/orderModel");
const Expenses = require("../models/expensesModel");
const Product = require("../models/productModel");
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
    });

    if (orders.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No orders found for the selected period",
      });
    }

    // Get all unique product names from orders
    const productNames = new Set();
    for (const order of orders) {
      for (const item of order.items) {
        productNames.add(item.name);
      }
    }

    // Fetch all products with their categories
    const products = await Product.find({
      name: { $in: Array.from(productNames) },
    }).populate("category", "name");

    // Create a map of product name to category name
    const productCategoryMap = {};
    for (const product of products) {
      productCategoryMap[product.name] = product.category?.name || "Uncategorized";
    }


    // Attach category info to order items
    for (const order of orders) {
      for (const item of order.items) {
        item.categoryName = productCategoryMap[item.name] || "Uncategorized";
      }
    }

    const fileName =
      type === "week" ? "week_orders_report.xlsx" : "today_orders_report.xlsx";

    let grandTotal = 0;
    const productSummary = {};

    for (const order of orders) {
      for (const item of order.items) {
        const productName = item.name;
        const quantity = item.quantity;
        const total = item.pricePerQuantity * quantity;

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

    // Generate Excel buffer (not file)
    const buffer = await generateIncomeReportService(
      type === "week" ? "Week Orders" : "Today Orders",
      productSummary,
      grandTotal,
      type,
      orders
    );

    // Set headers for file download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Length", buffer.length);

    // Send the buffer
    res.send(buffer);
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
        message: "No expenses found for the selected period",
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

    // Generate Excel buffer (not file)
    const buffer = await generateExpensesReportService(
      type === "week" ? "Week Expenses" : "Today Expenses",
      expensesSummary,
      grandTotal
    );

    // Set headers for file download
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.setHeader("Content-Length", buffer.length);

    // Send the buffer
    res.send(buffer);
  } catch (err) {
    next(err);
  }
};
module.exports = {
  generateIncomeReport,
  generateExpensesReport,
};
