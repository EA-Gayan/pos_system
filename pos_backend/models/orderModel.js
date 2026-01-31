const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customerDetails: {
      name: { type: String },
      phone: { type: String },
      guests: { type: Number },
    },
    orderId: {
      type: String,
      required: true,
    },
    orderStatus: {
      type: Number,
      required: true,
    },
    orderDate: {
      type: Date,
      default: Date.now(),
    },
    bills: {
      total: { type: Number, required: true },
      tax: { type: Number, required: true },
      discount: { type: Number },
      totalPayable: { type: Number, required: true },
    },
    items: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: { type: String, required: true },
        pricePerQuantity: { type: Number, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
      },
    ],
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
    },
    paymentMethod: { type: String, default: "Cash" },
  },
  { timestamps: true }
);

// Add index on orderDate for better query performance
orderSchema.index({ orderDate: 1 });

module.exports = mongoose.model("Order", orderSchema);
