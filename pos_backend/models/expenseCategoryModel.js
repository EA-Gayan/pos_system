const mongoose = require("mongoose");

// Admin-managed list of expense types the cashier picks from (e.g. Gas / ගෑස්)
const expenseCategorySchema = new mongoose.Schema(
  {
    nameEn: { type: String, required: true, trim: true },
    nameSi: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

// Case-insensitive unique English name
expenseCategorySchema.index(
  { nameEn: 1 },
  { unique: true, collation: { locale: "en", strength: 2 } }
);

module.exports = mongoose.model("ExpenseCategory", expenseCategorySchema);
