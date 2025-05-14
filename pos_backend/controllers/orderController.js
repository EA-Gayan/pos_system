const Order = require("../models/orderModel");
const createHttpError = require("http-errors");
const mongoose = require("mongoose");

const addOrder = async (req, res, next) => {
  try {
    const order = new Order(req.body);
    await order.save();
    res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const orderId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(orderId)) {
      const error = createHttpError(400, "Invalid Order ID!");
      return next(error);
    }

    const order = await Order.findById(orderId);

    if (!order) {
      const error = createHttpError(404, "Order not found!");
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: "Order retrieved successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const orders = await Order.find()
      .populate("table")
      .sort({ createdAt: -1 }) // Sort by newest first
      .limit(10); // Limit to last 10 entries

    res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      data: orders,
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

module.exports = {
  addOrder,
  getOrderById,
  getOrders,
  updateOrder,
  getOrdersCount,
};
