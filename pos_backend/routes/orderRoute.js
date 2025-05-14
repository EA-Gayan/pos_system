const express = require("express");
const { isVerifiedUser } = require("../middleware/tokenVerification");
const {
  addOrder,
  getOrders,
  getOrderById,
  updateOrder,
} = require("../controllers/orderController");
const {
  getTotalEarnings,
} = require("../controllers/getTotalEarningController");
const router = express.Router();

router.route("/earnings").get(isVerifiedUser, getTotalEarnings);

router.route("/").post(isVerifiedUser, addOrder);
router.route("/").get(isVerifiedUser, getOrders);
router.route("/:id").get(isVerifiedUser, getOrderById);
router.route("/:id").put(isVerifiedUser, updateOrder);

module.exports = router;
