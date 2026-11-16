const express = require("express");
const {
  getExpenseCategories,
  addExpenseCategory,
  updateExpenseCategory,
  deleteExpenseCategory,
} = require("../controllers/expenseCategoryController");
const { isVerifiedUser, isAdmin } = require("../middleware/tokenVerification");

const router = express.Router();

router.use(isVerifiedUser);

// Everyone can read the list; only admins manage it
router.route("/").get(getExpenseCategories).post(isAdmin, addExpenseCategory);
router
  .route("/:id")
  .put(isAdmin, updateExpenseCategory)
  .delete(isAdmin, deleteExpenseCategory);

module.exports = router;
