const Category = require("../models/categoryModel");
const Product = require("../models/productModel");
const createHttpError = require("http-errors");
const mongoose = require("mongoose");
const MealTypes = require("../enum/mealTypes");

/**
 * ADD CATEGORY
 */
const addCategory = async (req, res, next) => {
  try {
    const { categoryName, mealType } = req.body;

    // Validate name
    if (!categoryName) {
      return next(createHttpError(400, "Category name is required!"));
    }

    // Validate mealType (must be array)
    if (!Array.isArray(mealType) || mealType.length === 0) {
      return next(
        createHttpError(400, "At least one session type is required!")
      );
    }

    // Validate enum values
    const allowedValues = Object.values(MealTypes);
    const invalidTypes = mealType.filter(
      (type) => !allowedValues.includes(Number(type))
    );

    if (invalidTypes.length > 0) {
      return next(
        createHttpError(
          400,
          `Invalid mealType values: ${invalidTypes.join(", ")}`
        )
      );
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ name: categoryName });
    if (existingCategory) {
      return next(createHttpError(400, "Category already exists!"));
    }

    // Create category
    const newCategory = await Category.create({
      name: categoryName,
      mealType: mealType.map(Number),
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

/**
 * GET ALL CATEGORIES
 */
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

/**
 * UPDATE CATEGORY
 */
const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { categoryName, mealType } = req.body;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createHttpError(400, "Invalid Category ID!"));
    }

    // Validate name
    if (!categoryName) {
      return next(createHttpError(400, "Category name is required!"));
    }

    // Validate mealType
    if (!Array.isArray(mealType) || mealType.length === 0) {
      return next(
        createHttpError(400, "At least one session type is required!")
      );
    }

    const allowedMealTypes = Object.values(MealTypes);
    const invalidTypes = mealType.filter(
      (type) => !allowedMealTypes.includes(Number(type))
    );

    if (invalidTypes.length > 0) {
      return next(
        createHttpError(
          400,
          `Invalid mealType values: ${invalidTypes.join(", ")}`
        )
      );
    }

    // Check duplicate name
    const existingCategory = await Category.findOne({ name: categoryName });
    if (existingCategory && existingCategory._id.toString() !== id) {
      return next(createHttpError(400, "Category already exists!"));
    }

    // Update category
    const updatedCategory = await Category.findByIdAndUpdate(
      id,
      {
        name: categoryName,
        mealType: mealType.map(Number),
      },
      { new: true }
    );

    if (!updatedCategory) {
      return next(createHttpError(404, "Category not found!"));
    }

    res.status(200).json({
      success: true,
      message: "Category updated successfully!",
      data: updatedCategory,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE CATEGORY
 */
const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createHttpError(400, "Invalid Category ID!"));
    }

    const category = await Category.findById(id);
    if (!category) {
      return next(createHttpError(404, "Category not found!"));
    }

    // Remove category reference from products (SAFE)
    await Product.updateMany({ categories: id }, { $pull: { categories: id } });

    // Delete category
    await Category.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Category deleted successfully!",
    });
  } catch (error) {
    next(error);
  }
};

/**
 * SEARCH CATEGORY
 */
const searchCategory = async (req, res, next) => {
  try {
    const { value, selectedStatus } = req.body;

    if (!value || value.trim() === "") {
      return next(createHttpError(400, "Search query is required!"));
    }

    const regex = new RegExp(value, "i");
    //if mealtype is not 0 consider it also
    if (selectedStatus !== null) {
      const categories = await Category.find({ name: regex, mealType: selectedStatus });
      return res.status(200).json({
        success: true,
        message: "Search results",
        data: categories,
      });
    } else {
      const categories = await Category.find({ name: regex });
      return res.status(200).json({
        success: true,
        message: "Search results",
        data: categories,
      });
    }
  } catch (error) {
    next(error);
  }
};


module.exports = {
  addCategory,
  getCategories,
  updateCategory,
  deleteCategory,
  searchCategory,
};
