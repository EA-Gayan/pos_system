const express = require("express");
const {
  addExpenseRecord,
  getExpenseRecords,
  updateExpenseRecord,
  deleteExpenseRecord,
  searchByExpensesRecord,
} = require("../controllers/expensesController");
const router = express.Router();
const { isVerifiedUser } = require("../middleware/tokenVerification");

router.route("/").post(isVerifiedUser, addExpenseRecord);
router.route("/").get(isVerifiedUser, getExpenseRecords);
router.route("/:id").put(isVerifiedUser, updateExpenseRecord);
router.route("/delete/:id").delete(isVerifiedUser, deleteExpenseRecord);
router.route("/search").get(isVerifiedUser, searchByExpensesRecord);

module.exports = router;
