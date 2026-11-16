const mongoose = require("mongoose");

// Money handed to an employee — deducted from their earned salary.
const employeeWithdrawalSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 0.01 },
    date: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"],
    },
    type: {
      type: String,
      enum: ["advance", "salary"],
      default: "advance",
    },
    note: { type: String, trim: true, default: "" },
    // Set when recorded from the Expenses screen; the two records stay in sync
    expense: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Expenses",
      default: null,
    },
  },
  { timestamps: true }
);

employeeWithdrawalSchema.index({ employee: 1, date: 1 });

module.exports = mongoose.model("EmployeeWithdrawal", employeeWithdrawalSchema);
