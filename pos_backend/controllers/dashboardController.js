const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Order = require("../models/orderModel");
const Table = require("../models/tableModel");
const OrderTypes = require("../enum/orderTypes");
const Expenses = require("../models/expensesModel");
const connectDB = require("../config/database");

const getItemDetails = async (req, res, next) => {
  try {
    await connectDB();
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
    await connectDB();

    const now = new Date();
    const day = now.getDay(); // 0 (Sun) to 6 (Sat)
    const diffToMonday = day === 0 ? -6 : 1 - day; // Start from Monday

    // Monday 00:00:00.000 in local time
    const startDate = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + diffToMonday,
      0,
      0,
      0,
      0
    );

    // Sunday 23:59:59.999 in local time
    const endDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth(),
      startDate.getDate() + 6,
      23,
      59,
      59,
      999
    );

    // Local timezone offset string for MongoDB (e.g. "+05:30")
    const offsetMin = -now.getTimezoneOffset();
    const sign = offsetMin >= 0 ? "+" : "-";
    const h = String(Math.floor(Math.abs(offsetMin) / 60)).padStart(2, "0");
    const m = String(Math.abs(offsetMin) % 60).padStart(2, "0");
    const tzString = `${sign}${h}:${m}`;

    // Get Earnings grouped by date in local timezone
    const earningsData = await Order.aggregate([
      {
        $match: {
          $or: [
            { orderDate: { $gte: startDate, $lte: endDate } },
            { createdAt: { $gte: startDate, $lte: endDate } },
          ],
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: { $ifNull: ["$orderDate", "$createdAt"] },
              timezone: tzString,
              onNull: "unknown",
            },
          },
          income: { $sum: "$bills.totalPayable" },
        },
      },
    ]);

    // Get Expenses grouped by date in local timezone
    const expensesData = await Expenses.aggregate([
      {
        $match: {
          $or: [
            { createdAt: { $gte: startDate, $lte: endDate } },
            { updatedAt: { $gte: startDate, $lte: endDate } },
          ],
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$createdAt",
              timezone: tzString,
              onNull: "unknown",
            },
          },
          expenses: { $sum: "$amount" },
        },
      },
    ]);

    // Generate all 7 days of the current week in local calendar time
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const result = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(
        startDate.getFullYear(),
        startDate.getMonth(),
        startDate.getDate() + i
      );
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;
      const dayName = days[d.getDay()];

      const isToday =
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate();

      const dayLabel = isToday ? `Today (${dayName})` : `${dayName} (${dd}/${mm})`;

      const income = earningsData.find((e) => e._id === dateStr)?.income || 0;
      const expenses =
        expensesData.find((e) => e._id === dateStr)?.expenses || 0;

      result.push({
        date: dateStr,
        dayLabel,
        shortDay: dayName,
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
    await connectDB();

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
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    } else if (period === "week") {
      const day = now.getDay();
      const diffToMonday = day === 0 ? -6 : 1 - day;
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() + diffToMonday, 0, 0, 0, 0);
      endDate = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + 6, 23, 59, 59, 999);
    }

    // Aggregate best-selling products
    const bestSellingData = await Order.aggregate([
      {
        $match: {
          $or: [
            { orderDate: { $gte: startDate, $lte: endDate } },
            { createdAt: { $gte: startDate, $lte: endDate } },
          ],
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

const getTodaySessionSales = async (req, res, next) => {
  try {
    await connectDB();

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const orders = await Order.find({
      $or: [
        { orderDate: { $gte: startDate, $lte: endDate } },
        { createdAt: { $gte: startDate, $lte: endDate } },
      ],
    });

    if (orders.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No orders found for today",
        data: {
          summary: {
            totalItemsSold: 0,
            breakfastCount: 0,
            lunchCount: 0,
            dinnerCount: 0,
            totalRevenue: 0,
          },
          bySession: {
            breakfast: { sessionName: "Breakfast", sessionCode: 1, totalSoldQty: 0, totalRevenue: 0, items: [] },
            lunch: { sessionName: "Lunch", sessionCode: 2, totalSoldQty: 0, totalRevenue: 0, items: [] },
            dinner: { sessionName: "Dinner", sessionCode: 3, totalSoldQty: 0, totalRevenue: 0, items: [] },
          },
          allItems: [],
        },
      });
    }

    // Collect all product names and product IDs
    const productNames = new Set();
    const productIds = new Set();
    orders.forEach((order) => {
      (order.items || []).forEach((item) => {
        if (item.name) productNames.add(item.name.trim());
        if (item.product) productIds.add(item.product.toString());
      });
    });

    // Fetch products with populated category
    const products = await Product.find({
      $or: [
        { _id: { $in: Array.from(productIds) } },
        { name: { $in: Array.from(productNames) } },
      ],
    }).populate("category", "name mealType");

    const productMap = {};
    products.forEach((p) => {
      productMap[p._id.toString()] = p;
      productMap[p.name.toLowerCase().trim()] = p;
    });

    // 3 Sessions only: Breakfast (1), Lunch (2), Dinner (3)
    const sessions = {
      breakfast: { sessionName: "Breakfast", sessionCode: 1, totalSoldQty: 0, totalRevenue: 0, itemsMap: {} },
      lunch: { sessionName: "Lunch", sessionCode: 2, totalSoldQty: 0, totalRevenue: 0, itemsMap: {} },
      dinner: { sessionName: "Dinner", sessionCode: 3, totalSoldQty: 0, totalRevenue: 0, itemsMap: {} },
    };

    const allItemsMap = {};

    orders.forEach((order) => {
      // Calculate order's placement time in Sri Lanka (UTC+5:30)
      const orderDate = new Date(order.orderDate || order.createdAt);
      const utc = orderDate.getTime() + orderDate.getTimezoneOffset() * 60000;
      const slDate = new Date(utc + 3600000 * 5.5);
      const hour = slDate.getHours() + slDate.getMinutes() / 60;

      // Time-based session
      let timeSession = 1; // Breakfast (before 11:30 AM)
      if (hour >= 11.5 && hour < 16.5) {
        timeSession = 2; // Lunch (11:30 AM to 4:30 PM)
      } else if (hour >= 16.5) {
        timeSession = 3; // Dinner (after 4:30 PM)
      }

      (order.items || []).forEach((item) => {
        const trimmedName = (item.name || "").trim();
        if (!trimmedName) return;

        const matchedProduct =
          (item.product && productMap[item.product.toString()]) ||
          productMap[trimmedName.toLowerCase()] ||
          null;

        const category = matchedProduct?.category || null;
        const categoryName = category?.name || "Uncategorized";

        // Parse category mealType
        let mealTypes = [];
        if (Array.isArray(category?.mealType)) {
          mealTypes = category.mealType.map(Number);
        } else if (category?.mealType !== undefined && category?.mealType !== null) {
          mealTypes = [Number(category.mealType)];
        }

        // Only consider valid sessions: 1 (Breakfast), 2 (Lunch), 3 (Dinner)
        const validMealTypes = mealTypes.filter((t) => [1, 2, 3].includes(t));

        let assignedSession = 1;

        if (validMealTypes.length === 1) {
          // Category belongs strictly to 1 session
          assignedSession = validMealTypes[0];
        } else if (validMealTypes.length > 1) {
          // Category is connected to multiple sessions (e.g. all 3: [1, 2, 3])
          // Attribute this specific order to the session it was placed in!
          if (validMealTypes.includes(timeSession)) {
            assignedSession = timeSession;
          } else {
            assignedSession = validMealTypes[0];
          }
        } else {
          // Category has no 1/2/3 tag: attribute by order placement time!
          assignedSession = timeSession;
        }

        const sessionKey =
          assignedSession === 1 ? "breakfast" : assignedSession === 2 ? "lunch" : "dinner";

        const qty = Number(item.quantity) || 0;
        const unitPrice =
          Number(item.pricePerQuantity) ||
          (qty ? Number(item.price) / qty : 0) ||
          Number(matchedProduct?.price) ||
          0;
        const lineTotal = Number(item.price) || unitPrice * qty || 0;

        // Add to the specific session
        const sessionObj = sessions[sessionKey];
        sessionObj.totalSoldQty += qty;
        sessionObj.totalRevenue += lineTotal;

        if (!sessionObj.itemsMap[trimmedName]) {
          sessionObj.itemsMap[trimmedName] = {
            productName: trimmedName,
            categoryName,
            price: unitPrice,
            soldQty: 0,
            income: 0,
            sessionName: sessionObj.sessionName,
          };
        }
        sessionObj.itemsMap[trimmedName].soldQty += qty;
        sessionObj.itemsMap[trimmedName].income += lineTotal;

        // Add to consolidated all items map
        if (!allItemsMap[trimmedName]) {
          allItemsMap[trimmedName] = {
            productName: trimmedName,
            categoryName,
            price: unitPrice,
            totalSoldQty: 0,
            breakfastQty: 0,
            lunchQty: 0,
            dinnerQty: 0,
            income: 0,
          };
        }
        allItemsMap[trimmedName].totalSoldQty += qty;
        allItemsMap[trimmedName].income += lineTotal;
        if (assignedSession === 1) allItemsMap[trimmedName].breakfastQty += qty;
        if (assignedSession === 2) allItemsMap[trimmedName].lunchQty += qty;
        if (assignedSession === 3) allItemsMap[trimmedName].dinnerQty += qty;
      });
    });

    // Format items into sorted arrays
    const bySession = {
      breakfast: {
        sessionName: "Breakfast",
        sessionCode: 1,
        totalSoldQty: sessions.breakfast.totalSoldQty,
        totalRevenue: sessions.breakfast.totalRevenue,
        items: Object.values(sessions.breakfast.itemsMap).sort((a, b) => b.soldQty - a.soldQty),
      },
      lunch: {
        sessionName: "Lunch",
        sessionCode: 2,
        totalSoldQty: sessions.lunch.totalSoldQty,
        totalRevenue: sessions.lunch.totalRevenue,
        items: Object.values(sessions.lunch.itemsMap).sort((a, b) => b.soldQty - a.soldQty),
      },
      dinner: {
        sessionName: "Dinner",
        sessionCode: 3,
        totalSoldQty: sessions.dinner.totalSoldQty,
        totalRevenue: sessions.dinner.totalRevenue,
        items: Object.values(sessions.dinner.itemsMap).sort((a, b) => b.soldQty - a.soldQty),
      },
    };

    const allItems = Object.values(allItemsMap).sort((a, b) => b.totalSoldQty - a.totalSoldQty);

    const grandTotalQty =
      bySession.breakfast.totalSoldQty +
      bySession.lunch.totalSoldQty +
      bySession.dinner.totalSoldQty;

    const grandTotalRevenue =
      bySession.breakfast.totalRevenue +
      bySession.lunch.totalRevenue +
      bySession.dinner.totalRevenue;

    res.status(200).json({
      success: true,
      message: "Today session sales retrieved successfully",
      data: {
        summary: {
          totalItemsSold: grandTotalQty,
          breakfastCount: bySession.breakfast.totalSoldQty,
          lunchCount: bySession.lunch.totalSoldQty,
          dinnerCount: bySession.dinner.totalSoldQty,
          totalRevenue: grandTotalRevenue,
        },
        bySession,
        allItems,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getItemDetails,
  getWeeklyIncomeExpenses,
  getBestSellingProducts,
  getTodaySessionSales,
};
