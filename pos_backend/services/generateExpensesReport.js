const ExcelJS = require("exceljs");

const generateExpensesReportService = async (
  reportName,
  expensesDetails,
  totalExpenses
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
  sheet.addRow(["", "Total:", totalExpenses.toFixed(2)]);

  const lastRow = sheet.lastRow;
  lastRow.font = { bold: true };

  // Write to buffer instead of file
  const buffer = await workbook.xlsx.writeBuffer();

  return buffer;
};

module.exports = generateExpensesReportService;
