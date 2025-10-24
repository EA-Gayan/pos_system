const ExcelJS = require("exceljs");

const generateIncomeReportService = async (
  reportName,
  productDetails,
  totalIncome
) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(reportName);

  sheet.columns = [
    { header: "Product", key: "name", width: 30 },
    { header: "Qty", key: "qty", width: 10 },
    { header: "TotalIncome", key: "income", width: 15 },
  ];

  for (const [productName, data] of Object.entries(productDetails)) {
    sheet.addRow({
      name: productName,
      qty: data.qty,
      income: data.income.toFixed(2),
    });
  }

  // Add total row
  sheet.addRow(["", "Total:", totalIncome.toFixed(2)]);

  const lastRow = sheet.lastRow;
  lastRow.font = { bold: true };

  // Write to buffer instead of file
  const buffer = await workbook.xlsx.writeBuffer();

  return buffer;
};

module.exports = generateIncomeReportService;
