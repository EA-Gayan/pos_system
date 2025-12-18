const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Order = require("../models/orderModel");
const Table = require("../models/tableModel");
const OrderTypes = require("../enum/orderTypes");
const Expenses = require("../models/expensesModel");

const getItemDetails = async (req, res, next) => {
  try {
    const categoryCount = await Category.countDocuments();
    const productCount = await Product.countDocuments();
    const tableCount = await Table.countDocuments();
    const inProgressOrderCount = await Order.countDocuments({
      orderStatus: OrderTypes.INPROGRESS,
    });

    res.status(200).json([
      {
        key: "categories",
        title: "Total Categories",
        count: categoryCount,
        color: "#5b45b0",
      },
      {
        key: "products",
        title: "Total Items",
        count: productCount,
        color: "#285430",
      },
      {
        key: "tables",
        title: "Total Tables",
        count: tableCount,
        color: "#7f167f",
      },
      {
        key: "inProgressOrders",
        title: "Active Orders",
        count: inProgressOrderCount,
        color: "#735f32",
      },
    ]);
  } catch (error) {
    next(error);
  }
};

const getWeeklyIncomeExpenses = async (req, res, next) => {
  try {
    const now = new Date();
    const day = now.getDay(); // 0 (Sun) to 6 (Sat)
    const diffToMonday = day === 0 ? -6 : 1 - day; // Start from Monday
    const startDate = new Date(now);
    startDate.setDate(now.getDate() + diffToMonday);
    startDate.setHours(0, 0, 0, 0);

    const endDate = new Date(startDate);
    endDate.setDate(startDate.getDate() + 6);
    endDate.setHours(23, 59, 59, 999);

    // Get Earnings grouped by date
    const earningsData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          income: { $sum: "$bills.totalPayable" },
        },
      },
    ]);

    // Get Expenses grouped by date
    const expensesData = await Expenses.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          expenses: { $sum: "$amount" },
        },
      },
    ]);

    // Merge results into a single array for the week
    const result = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const dateStr = date.toISOString().split("T")[0]; // YYYY-MM-DD

      const income = earningsData.find((e) => e._id === dateStr)?.income || 0;
      const expenses =
        expensesData.find((e) => e._id === dateStr)?.expenses || 0;

      result.push({
        date: dateStr,
        income,
        expenses,
      });
    }

    res.status(200).json({
      success: true,
      message: "Weekly income and expenses retrieved",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const getBestSellingProducts = async (req, res, next) => {
  try {
    const { period = "today" } = req.query; // "today" or "week"

    if (!["today", "week"].includes(period)) {
      return res.status(400).json({
        success: false,
        message: "Invalid period. Use 'today' or 'week'.",
      });
    }

    const now = new Date();
    let startDate, endDate;

    if (period === "today") {
      // Start of today
      startDate = new Date(now.setHours(0, 0, 0, 0));
      endDate = new Date(now.setHours(23, 59, 59, 999));
    } else if (period === "week") {
      // Monday to Sunday of current week
      const day = now.getDay(); // 0 (Sun) to 6 (Sat)
      const diffToMonday = day === 0 ? -6 : 1 - day;
      startDate = new Date(now);
      startDate.setDate(now.getDate() + diffToMonday);
      startDate.setHours(0, 0, 0, 0);

      endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + 6);
      endDate.setHours(23, 59, 59, 999);
    }

    // Aggregate best-selling products
    const bestSellingData = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate },
        },
      },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.product",
          productName: { $first: "$items.name" },
          productPrice: { $first: "$items.pricePerQuantity" },
          sellingQty: { $sum: "$items.quantity" },
          income: { $sum: "$items.price" },
        },
      },
      { $sort: { sellingQty: -1 } }, // Highest quantity first
      { $limit: 10 },
    ]);

    // Populate product data (if product references exist)
    const populatedData = await Order.populate(bestSellingData, {
      path: "_id",
      model: "Product",
      select: "name price",
    });

    // Format the response table
    const formatted = populatedData.map((p) => ({
      productName: p.productName || p._id?.name || "Unknown",
      productPrice: p.productPrice || p._id?.price || 0,
      sellingQty: p.sellingQty,
      income: p.income,
    }));

    res.status(200).json({
      success: true,
      message: `Best-selling products for ${period}`,
      data: formatted,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getItemDetails,
  getWeeklyIncomeExpenses,
  getBestSellingProducts,
};
