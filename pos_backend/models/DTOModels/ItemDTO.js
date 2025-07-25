const mongoose = require("mongoose");

const ItemDto = {
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  name: { type: String, required: true },
  pricePerQuantity: { type: Number, required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
};

module.exports = {
  ItemDto,
};
