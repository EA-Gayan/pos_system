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
    // Side-by-Side Day Blocks Layout
    // Each Day uses 4 columns: [Date, Item, Qty, Income]
    // Days are placed horizontally: Day1 | Day2 | Day3 ...

    // 1. Group Data by Day -> Category -> Product
    const dayDataMap = {}; // { dateKey: { dateObj, categories: { catName: [items...] } } }

    orders.forEach(order => {
      const orderDate = new Date(order.orderDate);
      const dateKey = orderDate.toLocaleDateString("en-CA");

      if (!dayDataMap[dateKey]) {
        dayDataMap[dateKey] = {
          date: dateKey,
          categories: {},
          totalIncome: 0
        };
      }

      order.items.forEach(item => {
        const catName = item.categoryName || "Uncategorized";
        if (!dayDataMap[dateKey].categories[catName]) {
          dayDataMap[dateKey].categories[catName] = {};
        }
        if (!dayDataMap[dateKey].categories[catName][item.name]) {
          dayDataMap[dateKey].categories[catName][item.name] = {
            name: item.name,
            qty: 0,
            income: 0,
            cat: catName
          };
        }
        const pData = dayDataMap[dateKey].categories[catName][item.name];
        pData.qty += item.quantity;
        pData.income += item.pricePerQuantity * item.quantity;
        dayDataMap[dateKey].totalIncome += item.pricePerQuantity * item.quantity;
      });
    });

    const sortedDates = Object.keys(dayDataMap).sort();

    // 2. Pre-process Rows per Day (Flatten to linear list for printing)
    // Structure of processedRows[date]: Array of { type: 'data'|'spacer'|'total', name, qty, income, dateLabel }
    const processedRowsByDay = {};
    let maxHeight = 0;

    sortedDates.forEach(date => {
      const dayRows = [];
      const dayInfo = dayDataMap[date];
      const sortedCats = Object.keys(dayInfo.categories).sort();

      // Items
      let isFirstRow = true;
      sortedCats.forEach(cat => {
        const products = dayInfo.categories[cat];
        const sortedProds = Object.keys(products).sort();

        sortedProds.forEach(pName => {
          const item = products[pName];
          dayRows.push({
            type: 'data',
            dateLabel: isFirstRow ? date : "",
            name: item.name,
            qty: item.qty,
            income: item.income
          });
          isFirstRow = false;
        });
        // Spacer after Category
        dayRows.push({ type: 'spacer' });
      });

      // Total Row for Day
      dayRows.push({
        type: 'total',
        name: 'Daily Total',
        income: dayInfo.totalIncome
      });

      processedRowsByDay[date] = dayRows;
      if (dayRows.length > maxHeight) {
        maxHeight = dayRows.length;
      }
    });

    // 3. Define Columns
    // 4 cols per day
    const columns = [];
    sortedDates.forEach((date, index) => {
      // Headers for each block
      columns.push({ header: "දිනය", width: 12, key: `d${index}_date` });
      columns.push({ header: "අයිතම​", width: 25, key: `d${index}_name` });
      columns.push({ header: "ඒකක​", width: 8, key: `d${index}_qty` });
      columns.push({ header: "මුදල", width: 12, key: `d${index}_income` }); // Slightly narrower to fit many cols
    });
    sheet.columns = columns; // This sets the header row too

    // Style Header Row
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, size: 10, color: { argb: "FFFFFFFF" } }; // White
    headerRow.alignment = { horizontal: "center", vertical: "middle" };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4472C4" }
    };

    // 4. Render Grid
    // Iterate from row 0 to maxHeight-1
    for (let r = 0; r < maxHeight; r++) {
      const rowVals = {};

      sortedDates.forEach((date, i) => {
        const dayRows = processedRowsByDay[date];
        const cellData = dayRows[r];

        if (cellData) {
          const prefix = `d${i}`;
          if (cellData.type === 'data') {
            rowVals[`${prefix}_date`] = cellData.dateLabel;
            rowVals[`${prefix}_name`] = cellData.name;
            rowVals[`${prefix}_qty`] = cellData.qty;
            rowVals[`${prefix}_income`] = cellData.income.toFixed(2);
          } else if (cellData.type === 'total') {
            rowVals[`${prefix}_name`] = "Total:";
            rowVals[`${prefix}_income`] = cellData.income.toFixed(2);
          }
          // spacers result in empty cells, which is default
        }
      });

      const row = sheet.addRow(rowVals);

      // Styling per cell
      sortedDates.forEach((date, i) => {
        const dayRows = processedRowsByDay[date];
        const cellData = dayRows[r];
        if (cellData) {
          const colBase = (i * 4) + 1; // 1-based index

          // Alignments
          row.getCell(colBase + 2).alignment = { horizontal: "center" }; // Qty
          row.getCell(colBase + 3).alignment = { horizontal: "right" };  // Income

          // Bold Total
          if (cellData.type === 'total') {
            row.getCell(colBase + 1).font = { bold: true };
            row.getCell(colBase + 3).font = { bold: true };
            row.getCell(colBase + 3).fill = {
              type: "pattern", pattern: "solid", fgColor: { argb: "FFFFD966" }
            };
          }

          // Bold First Date occurence
          if (cellData.type === 'data' && cellData.dateLabel) {
            row.getCell(colBase).font = { bold: true };
          }
        }
      });
    }

    // Add Grand Total row at the very bottom? 
    // Or just rely on daily totals.
    // Let's add a Grand Total at the bottom left or strictly under the last day? 
    // Side-by-side relies on seeing totals per column.
    // Let's stick to daily totals included in the grid.

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

        row.getCell(2).alignment = { horizontal: "center", vertical: "middle" };
      }

      sheet.addRow({});
    }

    // Style header row
    const headerRow = sheet.getRow(1);
    headerRow.font = { bold: true, size: 10 };
    headerRow.alignment = { horizontal: "center", vertical: "middle" };
    headerRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFD3D3D3" },
    };
    headerRow.height = 22;

    // Add total row
    const totalRow = sheet.addRow(
      ["", "මුළු මුදල:", totalIncome.toFixed(2)]
    );

    totalRow.font = { bold: true, size: 11 };
    totalRow.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFFFF2CC" },
    };
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
};

module.exports = generateIncomeReportService;
