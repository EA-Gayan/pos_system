const express = require("express");
const { isVerifiedUser } = require("../middleware/tokenVerification");
const {
  addProduct,
  getProductsByCategory,
  updateProduct,
  deleteProduct,
  searchProduct,
} = require("../controllers/productController");
const router = express.Router();

router.route("/").post(isVerifiedUser, addProduct);
router.route("/search").get(isVerifiedUser, searchProduct);
router.route("/:id").get(isVerifiedUser, getProductsByCategory);
router.route("/:id").put(isVerifiedUser, updateProduct);
router.route("/delete/:id").delete(isVerifiedUser, deleteProduct);
module.exports = router;
