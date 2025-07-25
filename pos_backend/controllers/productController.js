const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const createHttpError = require("http-errors");
const mongoose = require("mongoose");

const addProduct = async (req, res, next) => {
  try {
    const { name, sname, price, description, categoryId } = req.body;

    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      const error = createHttpError(400, "Category not found!");
      return error;
    }

    // Check if product already exists
    const existingProduct = await Product.findOne({ name: name });
    if (existingProduct) {
      const error = createHttpError(400, "Product already exists!");
      return next(error);
    }
    // Check if short name already exists
    const existingsName = await Product.findOne({ sName: sName });
    if (existingsName) {
      const error = createHttpError(400, "Product already exists!");
      return next(error);
    }

    // Create new product
    const newProduct = new Product({
      name,
      sname,
      price,
      description,
      category: categoryId,
      sName,
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
    const { name, sname, price, description, categoryId, sName } = req.body;

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
      { name, sname, price, description, category: categoryId, sName },
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

const deleteProduct = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate Product ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = createHttpError(400, "Invalid Product ID!");
      return next(error);
    }

    // Find and delete the product
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      const error = createHttpError(404, "Product not found!");
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: deletedProduct,
    });
  } catch (error) {
    next(error);
  }
};

const searchProductsByName = async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      return next(createHttpError(400, "Product name is required in query"));
    }

    // Search for products with matching name (case-insensitive), allow multiple results
    const products = await Product.find({
      $or: [
        { name: { $regex: new RegExp(name, "i") } },
        { sname: { $regex: new RegExp(name, "i") } },
      ],
    }).populate("category");

    res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      data: products,
    });
  } catch (error) {
    next(error);
  }
};

const searchProduct = async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return next(createHttpError(400, "Search query is required!"));
    }

    const regex = new RegExp(query, "i"); // case-insensitive

    const products = await Product.find({
      $or: [
        { name: regex },
        { sName: regex }, // adjust field names based on your schema
      ],
    });

    res.status(200).json({
      success: true,
      message: "Search results",
      data: products,
    });
  } catch (error) {
    next(error);
  }
};
module.exports = {
  addProduct,
  getProductsByCategory,
  updateProduct,
  deleteProduct,
  searchProductsByName,
  searchProduct,
};
