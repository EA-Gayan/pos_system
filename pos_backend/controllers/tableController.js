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

const deleteTable = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate ID format
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return next(createHttpError(400, "Invalid Category ID!"));
    }

    // Try finding and deleting the Table
    const deletedTable = await Table.findByIdAndDelete(id);

    if (!deletedTable) {
      return next(createHttpError(404, "Table not found!"));
    }

    res.status(200).json({
      message: "Table deleted successfully!",
      data: deletedTable,
    });
  } catch (error) {
    next(error);
  }
};

const searchTableByTableNo = async (req, res, next) => {
  try {
    const { tableNo } = req.body;

    if (!tableNo) {
      return next(createHttpError(400, "Table number is required in query."));
    }

    const table = await Table.findOne({ tableNo: Number(tableNo) });

    if (!table) {
      return next(createHttpError(404, "Table not found."));
    }

    res.status(200).json({
      success: true,
      message: "Table retrieved successfully",
      data: table,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addTable,
  getTables,
  updateTable,
  deleteTable,
  searchTableByTableNo,
};
