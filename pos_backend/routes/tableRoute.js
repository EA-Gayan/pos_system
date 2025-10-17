const express = require("express");
const {
  addTable,
  getTables,
  updateTable,
  deleteTable,
  searchTableByTableNo,
} = require("../controllers/tableController");
const router = express.Router();
const { isVerifiedUser } = require("../middleware/tokenVerification");

router.route("/search/table").post(isVerifiedUser, searchTableByTableNo);
router.route("/").post(isVerifiedUser, addTable);
router.route("/").get(isVerifiedUser, getTables);
router.route("/:id").put(isVerifiedUser, updateTable);
router.route("/delete/:id").delete(isVerifiedUser, deleteTable);

module.exports = router;
