const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const createHttpError = require("http-errors");
const mongoose = require("mongoose");

const addProduct = async (req, res, next) => {
  try {
    const { name, price, description, categoryId } = req.body;

    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      const error = createHttpError(400, "Category not found!");
      return error;
    }

    // Create new product
    const newProduct = new Product({
      name,
      price,
      description,
      category: categoryId,
    });

    // Save product to DB
    const savedProduct = await newProduct.save();

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: savedProduct,
    });
  } catch (error) {
    next(error);
  }
};

const getProductsByCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if category exists
    const category = await Category.findById(id);
    if (!category) {
      const error = createHttpError(400, "Category not found!");
      return error;
    }

    // Find products with that category
    const products = await Product.find({ category: id });

    res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

const updateProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, price, description, categoryId } = req.body;

    // If categoryId is provided, validate it
    if (categoryId) {
      const category = await Category.findById(categoryId);
      if (!category) {
        const error = createHttpError(400, "Category not found!");
        return error;
      }
    }

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = createHttpError(400, "Invalid Product ID!");
      return next(error);
    }

    // Find and update product
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { name, price, description, category: categoryId },
      { new: true, runValidators: true }
    );

    if (!updatedProduct) {
      const error = createHttpError(404, "Product not found!");
      return error;
    }

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addProduct,
  getProductsByCategory,
  updateProduct,
};
