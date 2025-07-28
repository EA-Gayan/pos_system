const mongoose = require("mongoose");
const { ItemDto } = require("./DTOModels/ItemDTO");

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
    items: [ItemDto],
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
    },
    paymentMethod: { type: String, default: "Cash" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
