const Product = require("../models/productModel");
const Category = require("../models/categoryModel");
const Order = require("../models/orderModel");
const Table = require("../models/tableModel");
const OrderTypes = require("../enum/orderTypes");

const getItemDetails = async (req, res, next) => {
  try {
    const categoryCount = await Category.countDocuments();
    const productCount = await Product.countDocuments();
    const tableCount = await Table.countDocuments();
    const inProgressOrderCount = await Order.countDocuments({
      orderStatus: OrderTypes.INPROGRESS,
    });

    res.status(200).json([
      {
        key: "categories",
        title: "Total Categories",
        count: categoryCount,
        color: "#5b45b0",
      },
      {
        key: "products",
        title: "Total Items",
        count: productCount,
        color: "#285430",
      },
      {
        key: "tables",
        title: "Total Tables",
        count: tableCount,
        color: "#7f167f",
      },
      {
        key: "inProgressOrders",
        title: "Active Orders",
        count: inProgressOrderCount,
        color: "#735f32",
      },
    ]);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getItemDetails,
};
