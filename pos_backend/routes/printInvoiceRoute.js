const express = require("express");
const { printInvoice } = require("../controllers/printInvoiceController");
const router = express.Router();
const { isVerifiedUser } = require("../middleware/tokenVerification");

router.route("/:orderId").get(isVerifiedUser, printInvoice);

module.exports = router;
