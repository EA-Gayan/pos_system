const Table = require("../models/tableModel");
const createHttpError = require("http-errors");
const mongoose = require("mongoose");

const addTable = async (req, res, next) => {
  try {
    const { tableNo, noOfSeats } = req.body;

    if (!tableNo) {
      const error = createHttpError(400, "Please provide table No!");
      return error;
    }

    const isTableExist = await Table.findOne({ tableNo });
    if (isTableExist) {
      const error = createHttpError(400, "Table already exists!");
      return error;
    }

    const newTable = new Table({ tableNo, noOfSeats });
    await newTable.save();

    res.status(201).json({
      success: true,
      message: "Table created successfully",
      data: newTable,
    });
  } catch (error) {
    next(error);
  }
};

const getTables = async (req, res, next) => {
  try {
    const tables = await Table.find();
    res.status(200).json({
      success: true,
      message: "Tables retrieved successfully",
      data: tables,
    });
  } catch (error) {
    next(error);
  }
};

const updateTable = async (req, res, next) => {
  try {
    const { status, orderId } = req.body;

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = createHttpError(400, "Invalid Order ID!");
      return next(error);
    }

    const tableUpdate = await Table.findByIdAndUpdate(
      id,
      { status: status, currentOrder: orderId },
      { new: true }
    );

    if (!tableUpdate) {
      const error = createHttpError(404, "Table not found!");
      return next(error);
    }

    res.status(200).json({
      success: true,
      message: "Table updated!",
      data: tableUpdate,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { addTable, getTables, updateTable };
