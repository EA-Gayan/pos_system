const express = require("express");
const { isVerifiedUser } = require("../middleware/tokenVerification");
const {
  generateTodayOrderExcel,
} = require("../controllers/generateXmlController");
const router = express.Router();

router.route("/today").get(isVerifiedUser, generateTodayOrderExcel);

module.exports = router;
