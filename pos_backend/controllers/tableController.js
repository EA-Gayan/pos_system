const Table = require("../models/tableModel");
const TableCart = require("../models/tableCartModel");
const createHttpError = require("http-errors");
const mongoose = require("mongoose");
const connectDB = require("../config/database");

const addTable = async (req, res, next) => {
  try {
    await connectDB();
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

    // Fetch all draft carts and build a map: tableId -> draftTotal
    const carts = await TableCart.find();
    const draftMap = {};
    for (const cart of carts) {
      const total = cart.items.reduce((sum, item) => sum + (item.price || 0), 0);
      draftMap[cart.table.toString()] = total;
    }

    const tablesWithDraft = tables.map((t) => {
      const obj = t.toObject();
      const draftTotal = draftMap[t._id.toString()];
      obj.draftTotal = draftTotal !== undefined ? draftTotal : null;
      return obj;
    });

    res.status(200).json({
      success: true,
      message: "Tables retrieved successfully",
      data: tablesWithDraft,
    });
  } catch (error) {
    next(error);
  }
};

const updateTable = async (req, res, next) => {
  try {
    const { status, orderId, noOfSeats } = req.body;

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      const error = createHttpError(400, "Invalid Order ID!");
      return next(error);
    }

    const tableUpdate = await Table.findByIdAndUpdate(
      id,
      { status: status, currentOrder: orderId, noOfSeats: noOfSeats },
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
