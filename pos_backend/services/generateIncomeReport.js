const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

const generateIncomeReport = async (
  reportName,
  file,
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

  const fileName = file;

  const reportsDir = path.join(__dirname, "..", "public", "reports");
  const filePath = path.join(reportsDir, fileName);

  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  // Step 5: Write to file
  await workbook.xlsx.writeFile(filePath);
};

module.exports = generateIncomeReport;
