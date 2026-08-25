const express = require("express");
const {
  getTableCart,
  updateTableCart,
  clearTableCart,
} = require("../controllers/tableCartController");

const router = express.Router();

router.get("/:tableId", getTableCart);
router.post("/:tableId", updateTableCart);
router.delete("/:tableId", clearTableCart);

module.exports = router;
