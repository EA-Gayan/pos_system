const express = require("express");
const {
  addTable,
  getTables,
  updateTable,
  deleteTable,
} = require("../controllers/tableController");
const router = express.Router();
const { isVerifiedUser } = require("../middleware/tokenVerification");

router.route("/").post(isVerifiedUser, addTable);
router.route("/").get(isVerifiedUser, getTables);
router.route("/:id").put(isVerifiedUser, updateTable);
router.route("/delete/:id").delete(isVerifiedUser, deleteTable);

module.exports = router;
