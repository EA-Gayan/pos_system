const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");

const generateExpensesReport = async (
  reportName,
  file,
  expensesDetails,
  totalIncome
) => {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(reportName);

  sheet.columns = [
    { header: "Description", key: "description", width: 30 },
    { header: "Total", key: "total", width: 10 },
  ];

  for (const [description, data] of Object.entries(expensesDetails)) {
    sheet.addRow({
      description: description,
      total: data.total.toFixed(2),
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

module.exports = generateExpensesReport;
