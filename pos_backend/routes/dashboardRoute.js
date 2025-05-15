const express = require("express");
const { isVerifiedUser } = require("../middleware/tokenVerification");
const { getItemDetails } = require("../controllers/dashboardController");
const router = express.Router();

router.route("/item-details").get(isVerifiedUser, getItemDetails);

module.exports = router;
