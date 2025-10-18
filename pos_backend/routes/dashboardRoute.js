const express = require("express");
const { isVerifiedUser } = require("../middleware/tokenVerification");
const {
  getItemDetails,
  getWeeklyIncomeExpenses,
  getBestSellingProducts,
} = require("../controllers/dashboardController");
const router = express.Router();

router.route("/item-details").get(isVerifiedUser, getItemDetails);
router.route("/getWeeklyData").get(isVerifiedUser, getWeeklyIncomeExpenses);
router.route("/best-selling").get(isVerifiedUser, getBestSellingProducts);

module.exports = router;
