const Order = require("../models/orderModel");
const createHttpError = require("http-errors");
const mongoose = require("mongoose");
const OrderTypes = require("../enum/orderTypes");

const addOrder = async (req, res, next) => {
  try {
    const body = { ...req.body };

    // Validate table only if provided
    if (body.table !== undefined && body.table !== null && body.table !== "") {
      if (!mongoose.Types.ObjectId.isValid(body.table)) {
        return next(createHttpError(400, "Invalid table ID"));
      }
    } else {
      delete body.table;
    }

    const order = new Order(body);

    const today = new Date();
    const yy = today.getFullYear().toString().slice(-2);
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const datePrefix = `${yy}${mm}${dd}`;

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const todayOrders = await Order.find({
      orderDate: { $gte: startOfDay, $lte: endOfDay },
    });

    const count = todayOrders.length;
    order.orderId = `${datePrefix} - ${count + 1}`;
    order.orderStatus = body.orderStatus || OrderTypes.INPROGRESS;

    await order.save();

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    return next(error);
  }
};

const findOrders = async (req, res, next) => {
  try {
    const { id, status } = req.body;

    if (id) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return next(createHttpError(400, "Invalid Order ID!"));
      }
      const order = await Order.findById(id)
        .sort({ createdAt: -1 }) // Sort by newest first
        .limit(9);
      if (!order) {
        return next(createHttpError(404, "Order not found!"));
      }
      return res.status(200).json({
        success: true,
        message: "Order retrieved successfully",
        data: order,
      });
    }

    if (status !== undefined) {
      let queryStatus;
      if (status === 3) {
        queryStatus = [OrderTypes.INPROGRESS, OrderTypes.COMPLETE];
      } else {
        queryStatus = [status];
      }
      const orders = await Order.find({
        orderStatus: { $in: queryStatus },
      })
        .sort({ createdAt: -1 }) // Sort by newest first
        .limit(9);
      return res.status(200).json({
        success: true,
        message: "Orders retrieved successfully",
        data: orders,
      });
    }

    return next(
      createHttpError(400, "Please provide order ID or status in request body.")
    );
  } catch (error) {
    next(error);
  }
};
const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("table")
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(9); // Limit to last 10 entries

    res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      data: orders,
      type: "orders",
    });
  } catch (error) {
    next(error);
  }
};

const updateOrder = async (req, res, next) => {
  try {
    const orderId = req.params.id;
    const { orderStatus } = req.body;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      const error = createHttpError(400, "Invalid Order ID!");
      return next(error);
    }

    const orderUpdate = await Order.findByIdAndUpdate(
      orderId,
      { orderStatus },
      { new: true }
    );

    if (!orderUpdate) {
      const error = createHttpError(404, "Order not found!");
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: orderUpdate,
    });
  } catch (error) {
    next(error);
  }
};

const getOrdersCount = async (req, res, next) => {
  try {
    const { period } = req.body;
    const match = {};

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (period === "today") {
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      match.createdAt = { $gte: today, $lt: tomorrow };
    } else if (period === "yesterday") {
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      match.createdAt = { $gte: yesterday, $lt: today };
    } else if (period === "week") {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - today.getDay()); // Sunday
      match.createdAt = {
        $gte: startOfWeek,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      };
    } else if (period === "month") {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      match.createdAt = {
        $gte: startOfMonth,
        $lt: new Date(today.getTime() + 24 * 60 * 60 * 1000),
      };
    }

    const ordersCount = await Order.find(match).populate("table");
    res.status(200).json({
      success: true,
      message: "Orders count retrieved successfully",
      data: ordersCount.length,
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
};

const getRecentOrders = async (req, res, next) => {
  try {
    const recentOrders = await Order.find()
      .populate("table") // populate table info if available
      .sort({ createdAt: -1 }) // newest orders first
      .limit(3);

    res.status(200).json({
      success: true,
      message: "Recent Orders retrieved successfully",
      data: recentOrders,
      type: "orders",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addOrder,
  findOrders,
  getOrders,
  updateOrder,
  getOrdersCount,
  getRecentOrders,
};
