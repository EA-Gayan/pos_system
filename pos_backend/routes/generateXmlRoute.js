const express = require("express");
const { isVerifiedUser } = require("../middleware/tokenVerification");
const {
  generateTodayIncomeReport,
  generateTodayExpensesReport,
} = require("../controllers/generateXmlController");
const router = express.Router();

router.route("/today/income").get(isVerifiedUser, generateTodayIncomeReport);
router
  .route("/today/expenses")
  .get(isVerifiedUser, generateTodayExpensesReport);

module.exports = router;
