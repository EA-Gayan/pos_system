const Category = require("../models/categoryModel");
const createHttpError = require("http-errors");
const mongoose = require("mongoose");
const MealTypes = require("../enum/mealTypes");

const addCategory = async (req, res, next) => {
  try {
    const { categoryName, mealType } = req.body;

    if (!categoryName) {
      const error = createHttpError(400, "Category name is required!");
      return next(error);
    }
    if (mealType == null) {
      return next(createHttpError(400, "mealType is required!"));
    }

    // Ensure mealType is one of our enum values
    const allowedValues = Object.values(MealTypes);
    if (!allowedValues.includes(Number(mealType))) {
      return next(
        createHttpError(
          400,
          `Invalid mealType. Allowed values are: ${allowedValues.join(", ")}`
        )
      );
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ name: categoryName });
    if (existingCategory) {
      const error = createHttpError(400, "Category already exists!");
      return next(error);
    }

    // Create new category
    const newCategory = await Category.create({
      name: categoryName,
      mealType: mealType,
    });

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
    const categories = await Category.find().populate("products");

    res.status(200).json({
      success: true,
      message: "Categories retrieved successfully",
      data: categories,
      type: "category",
    });
  } catch (error) {
    next(error);
  }
};

const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const { categoryName, mealType } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = createHttpError(400, "Invalid Category ID!");
      return next(error);
    }

    if (!categoryName) {
      const error = createHttpError(400, "Category name is required!");
      return next(error);
    }

    if (mealType == null) {
      return next(createHttpError(400, "mealType is required!"));
    }

    const allowedMealTypes = Object.values(MealTypes);
    if (!allowedMealTypes.includes(Number(mealType))) {
      return next(
        createHttpError(
          400,
          `Invalid mealType. Allowed values are: ${allowedMealTypes.join(", ")}`
        )
      );
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ name: categoryName });
    if (existingCategory && existingCategory._id.toString() !== id) {
      const error = createHttpError(400, "Category already exists!");
      return next(error);
    }

    const categoryUpdate = await Category.findByIdAndUpdate(
      id,
      { name: categoryName, mealType: Number(mealType) },
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

const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createHttpError(400, "Invalid Category ID!"));
    }

    // Check if the category exists
    const category = await Category.findById(id);
    if (!category) {
      return next(createHttpError(404, "Category not found!"));
    }

    // Delete all products associated with this category
    await Product.deleteMany({ category: id });

    // Delete the category itself
    await Category.findByIdAndDelete(id);

    res.status(200).json({
      message: "Category and its related products deleted successfully!",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addCategory,
  getCategories,
  updateCategory,
  deleteCategory,
};
