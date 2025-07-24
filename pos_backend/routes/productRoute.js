const express = require("express");
const { isVerifiedUser } = require("../middleware/tokenVerification");
const {
  addProduct,
  getProductsByCategory,
  updateProduct,
  deleteProduct,
  searchProductsByName,
} = require("../controllers/productController");
const router = express.Router();

router.route("/search/product").post(isVerifiedUser, searchProductsByName);
router.route("/").post(isVerifiedUser, addProduct);
router.route("/:id").get(isVerifiedUser, getProductsByCategory);
router.route("/:id").put(isVerifiedUser, updateProduct);
router.route("/delete/:id").delete(isVerifiedUser, deleteProduct);

router.route("/search").get(isVerifiedUser, searchProduct);
module.exports = router;
