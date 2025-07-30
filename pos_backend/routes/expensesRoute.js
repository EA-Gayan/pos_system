const express = require("express");
const {
  addExpenseRecord,
  getExpenseRecords,
  updateExpenseRecord,
  deleteExpenseRecord,
  searchByExpensesRecord,
  getTotalExpenses,
} = require("../controllers/expensesController");
const router = express.Router();
const { isVerifiedUser } = require("../middleware/tokenVerification");

router.route("/").post(isVerifiedUser, addExpenseRecord);
router.route("/").get(isVerifiedUser, getExpenseRecords);
router.route("/:id").put(isVerifiedUser, updateExpenseRecord);
router.route("/delete/:id").delete(isVerifiedUser, deleteExpenseRecord);
router.route("/search").get(isVerifiedUser, searchByExpensesRecord);
router.route("/totalExpenses").post(isVerifiedUser, getTotalExpenses);

module.exports = router;
