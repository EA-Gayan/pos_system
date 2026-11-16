const mongoose = require("mongoose");
const EmployeePositions = require("../enum/employeePositions");

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    position: {
      type: Number,
      enum: Object.values(EmployeePositions),
      required: true,
    },
    // Only used when position is OTHER
    customPosition: {
      type: String,
      trim: true,
      default: "",
      required: [
        function () {
          return this.position === EmployeePositions.OTHER;
        },
        "Enter the role name for 'Other'",
      ],
    },
    phone: { type: String, trim: true, default: "" },
    nic: { type: String, trim: true, default: "" },
    address: { type: String, trim: true, default: "" },
    emergencyContact: { type: String, trim: true, default: "" },
    // Local calendar date "YYYY-MM-DD" — salary accrues from this day onward
    joinDate: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, "Join date must be YYYY-MM-DD"],
    },
    // Latest scheduled rate (mirrors the last salaryHistory entry, for quick display)
    dailySalary: { type: Number, required: true, min: 0 },
    // Effective-dated rates: each day is paid at the entry with the latest
    // effectiveFrom on or before that day, so a raise never rewrites past days.
    salaryHistory: [
      {
        dailySalary: { type: Number, required: true, min: 0 },
        effectiveFrom: {
          type: String,
          required: true,
          match: [/^\d{4}-\d{2}-\d{2}$/, "Effective date must be YYYY-MM-DD"],
        },
      },
    ],
    isActive: { type: Boolean, default: true },
    // Last working day for inactive employees; salary stops accruing after it
    endDate: {
      type: String,
      default: null,
      match: [/^\d{4}-\d{2}-\d{2}$/, "End date must be YYYY-MM-DD"],
    },
    notes: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Employee", employeeSchema);
