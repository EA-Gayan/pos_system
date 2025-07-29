const express = require("express");
const { isVerifiedUser } = require("../middleware/tokenVerification");
const {
  generateTodayIncomeReport,
  generateTodayExpensesReport,
} = require("../controllers/generateXmlController");
const router = express.Router();

router.route("/income:type").get(isVerifiedUser, generateTodayIncomeReport);
router.route("/expenses:type").get(isVerifiedUser, generateTodayExpensesReport);

module.exports = router;
