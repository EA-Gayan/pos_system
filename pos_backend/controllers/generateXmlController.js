const Order = require("../models/orderModel");
const Expenses = require("../models/expensesModel");
const Product = require("../models/productModel");
const generateExpensesReportService = require("../services/generateExpensesReport");
const generateIncomeReportService = require("../services/generateIncomeReport");

const REPORT_LABELS = { today: "Today", week: "Week", month: "Month" };
const reportLabel = (type) => REPORT_LABELS[type] || REPORT_LABELS.today;

// Date range for a report: today, this week (Mon–Sun) or this calendar month
const getReportRange = (type) => {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();
  const d = now.getDate();

  if (type === "month") {
    return {
      startDate: new Date(y, m, 1),
      endDate: new Date(y, m + 1, 0, 23, 59, 59, 999), // last day of month
    };
  }
  if (type === "week") {
    const monday = d - ((now.getDay() + 6) % 7);
    return {
      startDate: new Date(y, m, monday),
      endDate: new Date(y, m, monday + 6, 23, 59, 59, 999),
    };
  }
  return {
    startDate: new Date(y, m, d),
    endDate: new Date(y, m, d, 23, 59, 59, 999),
  };
};

const generateIncomeReport = async (req, res, next) => {
  try {
    const { type } = req.params;

    const { startDate, endDate } = getReportRange(type);

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

    const fileName = `${reportLabel(type).toLowerCase()}_orders_report.xlsx`;

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
      `${reportLabel(type)} Orders`,
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

    const { startDate, endDate } = getReportRange(type);

    const expenses = await Expenses.find({
      createdAt: { $gte: startDate, $lte: endDate },
    });

    if (expenses.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No expenses found for the selected period",
      });
    }

    const fileName = `${reportLabel(type).toLowerCase()}_expenses_report.xlsx`;

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
      `${reportLabel(type)} Expenses`,
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
