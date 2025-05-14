const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema(
  {
    tableNo: { type: Number, required: true },
    status: {
      type: String,
      default: "Available",
    },
    currentOrder: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    noOfSeats: { type: Number, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Table", tableSchema);
