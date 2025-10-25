const Order = require("../models/orderModel");
const printInvoiceService = require("../services/invoiceService");

const printInvoice = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    if (!orderId) {
      return res
        .status(400)
        .json({ success: false, message: "Order ID is required." });
    }

    const order = await Order.findOne({ orderId })
      .populate("items.product")
      .populate("table");

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found." });
    }

    // Generate PDF
    const pdfBuffer = await printInvoiceService(order);

    // Return PDF to client
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename=invoice-${orderId}.pdf`
    );
    res.send(pdfBuffer);
  } catch (error) {
    console.error("Error generating invoice:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate invoice.",
      error: error.message,
    });
  }
};

module.exports = { printInvoice };
