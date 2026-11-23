const express = require("express");
const {
  getEmployees,
  getEmployeeDetails,
  downloadPayslip,
  addEmployee,
  updateEmployee,
  deleteEmployee,
  clearEmployeeHistory,
  deleteSalaryEntry,
  markAttendance,
  addWithdrawal,
  deleteWithdrawal,
} = require("../controllers/employeeController");
const { isVerifiedUser, isAdmin } = require("../middleware/tokenVerification");

const router = express.Router();

// Salary data is sensitive — every employee route is admin-only
router.use(isVerifiedUser, isAdmin);

router.route("/").get(getEmployees).post(addEmployee);
router.route("/:id").get(getEmployeeDetails).put(updateEmployee).delete(deleteEmployee);
router.route("/:id/payslip").get(downloadPayslip);
router.route("/:id/history").delete(clearEmployeeHistory);
router.route("/:id/salary-history/:entryId").delete(deleteSalaryEntry);
router.route("/:id/attendance").put(markAttendance);
router.route("/:id/withdrawals").post(addWithdrawal);
router.route("/:id/withdrawals/:withdrawalId").delete(deleteWithdrawal);

module.exports = router;
