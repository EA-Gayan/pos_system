const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    customerDetails: {
      name: { type: String },
      phone: { type: String },
      guests: { type: Number },
    },
    orderStatus: {
      type: String,
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
    items: [],
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
    },
    paymentMethod: { type: String, default: "Cash" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
