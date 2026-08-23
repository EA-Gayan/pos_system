const TableCart = require("../models/tableCartModel");
const Table = require("../models/tableModel");
const createHttpError = require("http-errors");
const mongoose = require("mongoose");

// Get cart for a specific table
const getTableCart = async (req, res, next) => {
  try {
    const { tableId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tableId)) {
      return next(createHttpError(400, "Invalid Table ID!"));
    }

    const tableCart = await TableCart.findOne({ table: tableId }).populate("items.product");

    if (!tableCart) {
      return res.status(200).json({
        success: true,
        message: "No active cart for this table",
        data: { items: [] },
      });
    }

    res.status(200).json({
      success: true,
      message: "Cart retrieved successfully",
      data: tableCart,
    });
  } catch (error) {
    next(error);
  }
};

// Update or create cart for a specific table
const updateTableCart = async (req, res, next) => {
  try {
    const { tableId } = req.params;
    const { items } = req.body;

    if (!mongoose.Types.ObjectId.isValid(tableId)) {
      return next(createHttpError(400, "Invalid Table ID!"));
    }

    // Verify table exists
    const table = await Table.findById(tableId);
    if (!table) {
      return next(createHttpError(404, "Table not found!"));
    }

    // Upsert the cart
    const tableCart = await TableCart.findOneAndUpdate(
      { table: tableId },
      { items },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Cart updated successfully",
      data: tableCart,
    });
  } catch (error) {
    next(error);
  }
};

// Clear cart for a specific table
const clearTableCart = async (req, res, next) => {
  try {
    const { tableId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(tableId)) {
      return next(createHttpError(400, "Invalid Table ID!"));
    }

    await TableCart.findOneAndDelete({ table: tableId });

    res.status(200).json({
      success: true,
      message: "Cart cleared successfully",
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTableCart,
  updateTableCart,
  clearTableCart,
};
