const express = require("express");
const { isVerifiedUser } = require("../middleware/tokenVerification");
const {
  generateIncomeReport,
  generateExpensesReport,
} = require("../controllers/generateXmlController");
const router = express.Router();

router.route("/income").get(isVerifiedUser, generateIncomeReport);
router.route("/expenses").get(isVerifiedUser, generateExpensesReport);

module.exports = router;
