const mongoose = require("mongoose");

// Only exceptions are stored: a day with no record counts as a full working day.
const employeeAttendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    date: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"],
    },
    status: {
      type: String,
      enum: ["leave", "half-day"],
      required: true,
    },
    note: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

employeeAttendanceSchema.index({ employee: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("EmployeeAttendance", employeeAttendanceSchema);
