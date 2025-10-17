const express = require("express");
const { isVerifiedUser } = require("../middleware/tokenVerification");
const {
  addCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} = require("../controllers/categoryController");
const router = express.Router();

router.route("/").post(isVerifiedUser, addCategory);
router.route("/").get(isVerifiedUser, getCategories);
router.route("/:id").put(isVerifiedUser, updateCategory);
router.route("/delete/:id").delete(isVerifiedUser, deleteCategory);

module.exports = router;
