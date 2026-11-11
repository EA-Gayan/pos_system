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

const parseValidMealTypes = (category) => {
  let raw = [];
  if (Array.isArray(category?.mealType)) {
    raw = category.mealType.map(Number);
  } else if (category?.mealType !== undefined && category?.mealType !== null) {
    raw = [Number(category.mealType)];
  }
  return raw.filter((t) => [1, 2, 3].includes(t));
};

const getOrderSLHour = (order) => {
  // Prefer createdAt since legacy orders may have frozen orderDate defaults
  const dt = new Date(order.createdAt || order.orderDate);
  const utc = dt.getTime() + dt.getTimezoneOffset() * 60000;
  const slDate = new Date(utc + 3600000 * 5.5);
  return slDate.getHours() + slDate.getMinutes() / 60;
};

const pickCandidateByHour = (candidates, hour) => {
  if (candidates.length === 1) return candidates[0];
  if (candidates.includes(1) && hour < 10.5) return 1;
  if (candidates.includes(2) && hour >= 10.5 && hour < 16.0) return 2;
  if (candidates.includes(3) && hour >= 16.0) return 3;
  if (candidates.includes(2) && hour < 16.0) return 2;
  if (candidates.includes(1) && hour < 12.0) return 1;
  if (candidates.includes(3) && hour >= 12.0) return 3;
  return candidates[0] || 1;
};

const getTodaySessionSales = async (req, res, next) => {
  try {
    await connectDB();

    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const orders = await Order.find({
      createdAt: { $gte: startDate, $lte: endDate },
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

    // Collect all product names and product IDs referenced by today's orders
    const productNames = new Set();
    const productIds = new Set();
    orders.forEach((order) => {
      (order.items || []).forEach((item) => {
        if (item.name) productNames.add(item.name.trim());
        if (item.product) productIds.add(item.product.toString());
      });
    });

    // Build regexes matching trimmed names in case DB product names carry trailing whitespace
    const escapedNameRegexes = Array.from(productNames).map(
      (n) => new RegExp(`^\\s*${n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\s*$`, "i")
    );

    const products = await Product.find({
      $or: [
        { _id: { $in: Array.from(productIds) } },
        { name: { $in: escapedNameRegexes } },
      ],
    }).populate("category", "name mealType");

    // Index products by ID, (name + price), and name list to distinguish duplicate names across sessions
    const productById = {};
    const productsByNamePrice = {};
    const productsByName = {};

    products.forEach((p) => {
      productById[p._id.toString()] = p;
      const norm = p.name.toLowerCase().trim();
      const priceKey = `${norm}::${Number(p.price)}`;

      if (!productsByNamePrice[priceKey]) productsByNamePrice[priceKey] = [];
      productsByNamePrice[priceKey].push(p);

      if (!productsByName[norm]) productsByName[norm] = [];
      productsByName[norm].push(p);
    });

    const pickBySession = (list, preferredSession) => {
      if (!list || list.length === 0) return null;
      if (list.length === 1 || !preferredSession) return list[0];
      return (
        list.find((p) => parseValidMealTypes(p.category).includes(preferredSession)) ||
        list[0]
      );
    };

    const resolveProduct = (item, preferredSession = null) => {
      if (item.product && productById[item.product.toString()]) {
        return productById[item.product.toString()];
      }
      const norm = (item.name || "").toLowerCase().trim();
      const qty = Number(item.quantity) || 0;
      const unitPrice =
        Number(item.pricePerQuantity) || (qty ? Number(item.price) / qty : 0);

      if (unitPrice > 0) {
        const priceMatches = productsByNamePrice[`${norm}::${unitPrice}`];
        const matched = pickBySession(priceMatches, preferredSession);
        if (matched) return matched;
      }

      return pickBySession(productsByName[norm], preferredSession);
    };

    // 3 Sessions only: Breakfast (1), Lunch (2), Dinner (3)
    const sessions = {
      breakfast: { sessionName: "Breakfast", sessionCode: 1, totalSoldQty: 0, totalRevenue: 0, itemsMap: {} },
      lunch: { sessionName: "Lunch", sessionCode: 2, totalSoldQty: 0, totalRevenue: 0, itemsMap: {} },
      dinner: { sessionName: "Dinner", sessionCode: 3, totalSoldQty: 0, totalRevenue: 0, itemsMap: {} },
    };

    const allItemsMap = {};

    orders.forEach((order) => {
      const explicitMealSession = [1, 2, 3].includes(Number(order.mealSession))
        ? Number(order.mealSession)
        : null;

      // For orders without explicit mealSession, infer via category intersection before falling back to order time
      let fallbackSession = explicitMealSession;
      if (!fallbackSession) {
        let candidates = [1, 2, 3];
        (order.items || []).forEach((item) => {
          const p = resolveProduct(item);
          const valid = parseValidMealTypes(p?.category);
          if (valid.length > 0) {
            const intersection = candidates.filter((c) => valid.includes(c));
            if (intersection.length > 0) candidates = intersection;
          }
        });
        fallbackSession =
          candidates.length === 1
            ? candidates[0]
            : pickCandidateByHour(candidates, getOrderSLHour(order));
      }

      (order.items || []).forEach((item) => {
        const trimmedName = (item.name || "").trim();
        if (!trimmedName) return;

        const targetSessionHint = explicitMealSession || fallbackSession;
        const matchedProduct = resolveProduct(item, targetSessionHint);
        const category = matchedProduct?.category || null;
        const categoryName =
          category?.name || (item.isCombo ? "Combo Package" : "Uncategorized");
        const validMealTypes = parseValidMealTypes(category);

        // Priority: 1. Cashier's POS Meal Session -> 2. Strict Category Session -> 3. Order Intersection/Fallback
        let assignedSession = targetSessionHint;
        if (explicitMealSession) {
          if (validMealTypes.length === 1 && validMealTypes[0] !== explicitMealSession) {
            assignedSession = validMealTypes[0];
          } else {
            assignedSession = explicitMealSession;
          }
        } else {
          if (validMealTypes.length === 1) {
            assignedSession = validMealTypes[0];
          } else if (validMealTypes.length > 1) {
            assignedSession = validMealTypes.includes(fallbackSession)
              ? fallbackSession
              : validMealTypes[0];
          }
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

        const itemKey = `${trimmedName}::${categoryName}`;

        // Add to the specific session
        const sessionObj = sessions[sessionKey];
        sessionObj.totalSoldQty += qty;
        sessionObj.totalRevenue += lineTotal;

        if (!sessionObj.itemsMap[itemKey]) {
          sessionObj.itemsMap[itemKey] = {
            productName: trimmedName,
            categoryName,
            price: unitPrice,
            soldQty: 0,
            income: 0,
            sessionName: sessionObj.sessionName,
          };
        }
        sessionObj.itemsMap[itemKey].soldQty += qty;
        sessionObj.itemsMap[itemKey].income += lineTotal;

        // Add to consolidated all items map
        if (!allItemsMap[itemKey]) {
          allItemsMap[itemKey] = {
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
        allItemsMap[itemKey].totalSoldQty += qty;
        allItemsMap[itemKey].income += lineTotal;
        if (assignedSession === 1) allItemsMap[itemKey].breakfastQty += qty;
        if (assignedSession === 2) allItemsMap[itemKey].lunchQty += qty;
        if (assignedSession === 3) allItemsMap[itemKey].dinnerQty += qty;
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
