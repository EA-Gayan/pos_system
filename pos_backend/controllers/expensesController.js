const Expenses = require("../models/expensesModel");
const createHttpError = require("http-errors");
const mongoose = require("mongoose");

// add the expense record
const addExpenseRecord = async (req, res, next) => {
  try {
    const { description, amount } = req.body;

    if (!description || typeof amount !== "number") {
      throw createHttpError(400, "Invalid input data");
    }

    // Check if a record with the same description exists
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    let existingRecord = await Expenses.findOne({
      description,
      createdAt: { $gte: startOfDay, $lte: endOfDay },
    });

    if (existingRecord) {
      // Update the amount
      existingRecord.amount += amount;
      await existingRecord.save();

      res.status(200).json({
        success: true,
        message: "Amount updated for existing record",
        data: existingRecord,
      });
    } else {
      // Create a new record
      const newRecord = new Expenses({ description, amount });
      await newRecord.save();

      res.status(201).json({
        success: true,
        message: "Record created successfully",
        data: newRecord,
      });
    }
  } catch (error) {
    next(error);
  }
};

// get the expense records

const getExpenseRecords = async (req, res, next) => {
  try {
    const records = await Expenses.find();
    res.status(200).json({
      success: true,
      message: "Records retrieved successfully",
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

// update the expense record
const updateExpenseRecord = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { description, amount } = req.body.data;

    // Validate ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createHttpError(400, "Invalid Record ID!"));
    }

    // Update the expense record
    const updatedRecord = await Expenses.findByIdAndUpdate(
      id,
      { description, amount },
      { new: true, runValidators: true }
    );

    if (!updatedRecord) {
      return next(createHttpError(404, "Expense record not found."));
    }

    res.status(200).json({
      success: true,
      message: "Expense record updated successfully.",
      data: updatedRecord,
    });
  } catch (error) {
    next(error);
  }
};

// delete the expense record
const deleteExpenseRecord = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate Product ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = createHttpError(400, "Invalid Product ID!");
      return next(error);
    }

    // Find and delete the product
    const deleteRecord = await Expenses.findByIdAndDelete(id);

    if (!deleteRecord) {
      const error = createHttpError(404, "Product not found!");
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: deleteRecord,
    });
  } catch (error) {
    next(error);
  }
};

// search the expense record
const searchByExpensesRecord = async (req, res, next) => {
  try {
    const { query } = req.query;

    if (!query || query.trim() === "") {
      return next(createHttpError(400, "Search query is required!"));
    }

    const trimmedQuery = query.trim();
    let filter = {};

    // Check if query is a valid number
    if (!isNaN(trimmedQuery)) {
      filter = { amount: Number(trimmedQuery) };
    } else {
      // Otherwise search by description
      const regex = new RegExp(trimmedQuery, "i"); // case-insensitive
      filter = { description: regex };
    }

    const records = await Expenses.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: "Search results",
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addExpenseRecord,
  getExpenseRecords,
  updateExpenseRecord,
  deleteExpenseRecord,
  searchByExpensesRecord,
};
