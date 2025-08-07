const Order = require("../models/orderModel");
const printInvoiceService = require("../services/invoiceService");

const printInvoice = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res
        .status(400)
        .json({ success: false, message: "Order ID is required in params." });
    }

    const order = await Order.findOne({ orderId })
      .populate("items.product")
      .populate("table");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }

    await printInvoiceService(order); // Pass full order object

    return res
      .status(200)
      .json({ success: true, message: "Invoice sent to printer." });
  } catch (error) {
    console.error("Error printing invoice:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to print invoice.",
      error: error.message,
    });
  }
};

module.exports = {
  printInvoice,
};
