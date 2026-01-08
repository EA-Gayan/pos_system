const ExcelJS = require("exceljs");

const generateIncomeReportService = async (
  reportName,
  productDetails,
  totalIncome,
  type = "today",
  orders = []
) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(reportName);

  if (type === "week") {
    // Weekly report with date column
    sheet.columns = [
      { header: "දිනය", key: "date", width: 15 },
      { header: "අයිතම​", key: "name", width: 35 },
      { header: "විකුණුම් ඒකක​", key: "qty", width: 18 },
      { header: "මුළු මුදල", key: "income", width: 18 },
    ];

    // Group orders by date and category
    const ordersByDate = {};

    for (const order of orders) {
      const orderDate = new Date(order.orderDate);
      const dateKey = orderDate.toLocaleDateString("en-CA"); // YYYY-MM-DD format

      if (!ordersByDate[dateKey]) {
        ordersByDate[dateKey] = {};
      }

      for (const item of order.items) {
        const productName = item.name;
        // Use categoryName attached by controller
        const categoryName = item.categoryName || "Uncategorized";

        if (!ordersByDate[dateKey][categoryName]) {
          ordersByDate[dateKey][categoryName] = {};
        }

        if (!ordersByDate[dateKey][categoryName][productName]) {
          ordersByDate[dateKey][categoryName][productName] = {
            qty: 0,
            income: 0,
          };
        }

        ordersByDate[dateKey][categoryName][productName].qty += item.quantity;
        ordersByDate[dateKey][categoryName][productName].income += item.pricePerQuantity * item.quantity;
      }
    }

    // Sort dates
    const sortedDates = Object.keys(ordersByDate).sort();

    // Add rows grouped by date and category
    for (const date of sortedDates) {
      const categories = ordersByDate[date];
      const sortedCategories = Object.keys(categories).sort();

      let isFirstProductOfDate = true;

      for (const categoryName of sortedCategories) {
        const products = categories[categoryName];
        const productNames = Object.keys(products).sort();

        for (let i = 0; i < productNames.length; i++) {
          const productName = productNames[i];
          const data = products[productName];

          const row = sheet.addRow({
            date: isFirstProductOfDate ? date : "", // Show date only on first product of the day
            name: productName,
            qty: data.qty,
            income: data.income.toFixed(2),
          });

          // Center align quantity column
          row.getCell(3).alignment = { horizontal: "center", vertical: "middle" };

          // If first row of the date, make date bold
          if (isFirstProductOfDate) {
            row.getCell(1).font = { bold: true };
            isFirstProductOfDate = false;
          }
        }

        // Add a blank row after each category for spacing
        sheet.addRow({});
      }
    }
  } else {
    // Daily report (original format)
    sheet.columns = [
      { header: "අයිතම​", key: "name", width: 40 },
      { header: "විකුණුම් ඒකක​", key: "qty", width: 18 },
      { header: "මුළු මුදල", key: "income", width: 18 },
    ];

    // Group products by category
    const productsByCategory = {};

    for (const order of orders) {
      for (const item of order.items) {
        const productName = item.name;
        // Use categoryName attached by controller
        const categoryName = item.categoryName || "Uncategorized";

        if (!productsByCategory[categoryName]) {
          productsByCategory[categoryName] = {};
        }

        if (!productsByCategory[categoryName][productName]) {
          productsByCategory[categoryName][productName] = {
            qty: 0,
            income: 0,
          };
        }

        productsByCategory[categoryName][productName].qty += item.quantity;
        productsByCategory[categoryName][productName].income += item.pricePerQuantity * item.quantity;
      }
    }

    console.log("Categories found:", Object.keys(productsByCategory));

    // Sort categories and add rows
    const sortedCategories = Object.keys(productsByCategory).sort();

    for (const categoryName of sortedCategories) {
      const products = productsByCategory[categoryName];
      const productNames = Object.keys(products).sort();

      for (const productName of productNames) {
        const data = products[productName];

        const row = sheet.addRow({
          name: productName,
          qty: data.qty,
          income: data.income.toFixed(2),
        });

        // Center align quantity column
        row.getCell(2).alignment = { horizontal: "center", vertical: "middle" };
      }

      // Add a blank row after each category for spacing
      sheet.addRow({});
    }
  }

  // Style header row with smaller font
  const headerRow = sheet.getRow(1);
  headerRow.font = { bold: true, size: 10 }; // Reduced from 12 to 10
  headerRow.alignment = { horizontal: "center", vertical: "middle" };
  headerRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFD3D3D3" },
  };
  headerRow.height = 22; // Reduced from 25 to 22

  // Add total row
  const totalRow = sheet.addRow(
    type === "week"
      ? ["", "", "මුළු මුදල:", totalIncome.toFixed(2)]
      : ["", "මුළු මුදල:", totalIncome.toFixed(2)]
  );

  totalRow.font = { bold: true, size: 11 }; // Slightly smaller
  totalRow.fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFFFF2CC" },
  };

  // Write to buffer instead of file
  const buffer = await workbook.xlsx.writeBuffer();

  return buffer;
};

module.exports = generateIncomeReportService;
