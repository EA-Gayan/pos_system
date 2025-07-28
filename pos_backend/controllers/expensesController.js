const Expenses = require("../models/expensesModel");
const createHttpError = require("http-errors");

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

module.exports = {
  addExpenseRecord,
  getExpenseRecords,
};
