const mongoose = require("mongoose");

const expensesSchema = new mongoose.Schema(
  {
    // English label — a snapshot of the category / employee name, so reports
    // and search keep working even if the category is later deleted.
    description: { type: String, required: true },
    // Sinhala label snapshot (empty for old free-text records)
    descriptionSi: { type: String, default: "" },
    amount: { type: Number, required: true },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ExpenseCategory",
      default: null,
    },
    // Set when cash was handed to an employee — mirrored as a salary withdrawal
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    withdrawal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EmployeeWithdrawal",
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Expenses", expensesSchema);
