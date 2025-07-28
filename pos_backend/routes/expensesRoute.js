const express = require("express");
const {
  addExpenseRecord,
  getExpenseRecords,
} = require("../controllers/expensesController");
const router = express.Router();
const { isVerifiedUser } = require("../middleware/tokenVerification");

router.route("/").post(isVerifiedUser, addExpenseRecord);
router.route("/").get(isVerifiedUser, getExpenseRecords);

module.exports = router;
