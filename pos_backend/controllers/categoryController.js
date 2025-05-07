const Category = require("../models/categoryModel");
const createHttpError = require("http-errors");
const mongoose = require("mongoose");

const addCategory = async (req, res, next) => {
  try {
    const { categoryName } = req.body;

    if (!categoryName) {
      const error = createHttpError(400, "Category name is required!");
      return next(error);
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ name: categoryName });
    if (existingCategory) {
      const error = createHttpError(400, "Category already exists!");
      return next(error);
    }

    // Create new category
    const newCategory = await Category.create({ name: categoryName });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: newCategory,
    });
  } catch (error) {
    next(error);
  }
};

const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();

    res.status(200).json({
      success: true,
      message: "Categories retrieved successfully",
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { categoryName } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = createHttpError(400, "Invalid Category ID!");
      return next(error);
    }

    if (!categoryName) {
      const error = createHttpError(400, "Category name is required!");
      return next(error);
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ name: categoryName });
    if (existingCategory) {
      const error = createHttpError(400, "Category already exists!");
      return next(error);
    }

    const categoryUpdate = await Category.findByIdAndUpdate(
      id,
      { name: categoryName },
      { new: true }
    );

    if (!categoryUpdate) {
      const error = createHttpError(404, "Category not found!");
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: "Category updated!",
      data: categoryUpdate,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addCategory,
  getCategories,
  updateCategory,
};
