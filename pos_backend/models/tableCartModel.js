const mongoose = require("mongoose");

const tableCartSchema = new mongoose.Schema(
  {
    table: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Table",
      required: true,
      unique: true, // A table can only have one active cart at a time
    },
    items: [
      {
        id: { type: String }, // To map frontend cart ids
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        name: { type: String, required: true },
        pricePerQuantity: { type: Number, required: true },
        quantity: { type: Number, required: true },
        price: { type: Number, required: true },
        isCombo: { type: Boolean, default: false },
        comboProducts: [
          {
            name: { type: String },
            quantity: { type: Number },
          },
        ],
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("TableCart", tableCartSchema);
