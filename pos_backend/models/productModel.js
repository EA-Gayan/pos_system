const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category", // references the Category model
      required: true,
    },
    sName: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);
