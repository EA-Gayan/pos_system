const express = require("express");
const { isVerifiedUser } = require("../middleware/tokenVerification");
const {
  generateIncomeReport,
  generateExpensesReport,
} = require("../controllers/generateXmlController");
const router = express.Router();

router.route("/income/:type").get(isVerifiedUser, generateIncomeReport);
router.route("/expenses/:type").get(isVerifiedUser, generateExpensesReport);

module.exports = router;
