const express = require("express");
const { isVerifiedUser } = require("../middleware/tokenVerification");
const {
  addOrder,
  getOrders,
  getOrderById,
  updateOrder,
  getOrdersCount,
  getRecentOrders,
} = require("../controllers/orderController");
const {
  getTotalEarnings,
} = require("../controllers/getTotalEarningController");
const router = express.Router();

router.route("/earnings").post(isVerifiedUser, getTotalEarnings);
router.route("/count").post(isVerifiedUser, getOrdersCount);
router.route("/").post(isVerifiedUser, addOrder);
router.route("/").get(isVerifiedUser, getOrders);
router.route("/recentOrders").get(isVerifiedUser, getRecentOrders);
router.route("/:id").get(isVerifiedUser, getOrderById);
router.route("/:id").put(isVerifiedUser, updateOrder);

module.exports = router;
