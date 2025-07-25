const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");
const Product = require("../models/productModel");
const Order = require("../models/orderModel");

const generateTodayOrderExcel = async (req, res, next) => {
  try {
    // Step 1: Get today's date range
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    // Step 2: Fetch orders
    const orders = await Order.find({
      orderDate: { $gte: startOfDay, $lte: endOfDay },
    }).populate("items.product");

    console.log("Orders fetched:", orders);

    // Step 3: Aggregate data
    const productMap = new Map();
    let grandTotal = 0;

    for (const order of orders) {
      for (const item of order.items) {
        const product = item.product;
        const quantity = item.quantity;
        const total = product.price * quantity;

        if (!productMap.has(product._id.toString())) {
          productMap.set(product._id.toString(), {
            name: product.name,
            qty: 0,
            income: 0,
          });
        }

        const entry = productMap.get(product._id.toString());
        entry.qty += quantity;
        entry.income += total;

        grandTotal += total;
      }
    }

    // Step 4: Create Excel file
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Today Orders");

    // Header
    sheet.columns = [
      { header: "Product", key: "name", width: 30 },
      { header: "Qty", key: "qty", width: 10 },
      { header: "TotalIncome", key: "income", width: 15 },
    ];

    // Data rows
    for (const { name, qty, income } of productMap.values()) {
      sheet.addRow({
        name,
        qty,
        income: income.toFixed(2),
      });
    }

    // Add total row
    sheet.addRow(["", "Total:", grandTotal.toFixed(2)]);

    // Optional: Style the total row
    const lastRow = sheet.lastRow;
    lastRow.font = { bold: true };

    // Step 5: Write to file
    const filePath = path.join(__dirname, "today_orders_report.xlsx");
    await workbook.xlsx.writeFile(filePath);

    // Step 6: Send file to client
    res.download(filePath, "today_orders_report.xlsx", () => {
      // Delete file after sending (optional)
      fs.unlinkSync(filePath);
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  generateTodayOrderExcel,
};
