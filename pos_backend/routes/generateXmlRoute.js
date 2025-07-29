const express = require("express");
const { isVerifiedUser } = require("../middleware/tokenVerification");
const {
  generateIncomeReport,
  generateExpensesReport,
} = require("../controllers/generateXmlController");
const router = express.Router();

router.route("/income:type").get(isVerifiedUser, generateTodayIncomeReport);
router.route("/expenses:type").get(isVerifiedUser, generateTodayExpensesReport);

module.exports = router;
