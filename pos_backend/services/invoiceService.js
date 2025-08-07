const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { print, getPrinters } = require("pdf-to-printer");

const printInvoiceService = async (order) => {
  const filePath = path.join(__dirname, "invoice.pdf");

  // Step 1: Create PDF
  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: [210, 800], // 80mm width, dynamic height
      margins: { top: 10, bottom: 10, left: 10, right: 10 },
    });

    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    // === Sample Content ===
    doc
      .fontSize(12)
      .text("Jayanthi Hotel", { align: "center" })
      .moveDown()
      .fontSize(10)
      .text("Order Receipt", { align: "center" })
      .moveDown()
      .text("Item 1     Rs. 200")
      .text("Item 2     Rs. 150")
      .text("--------------------")
      .text("Total:     Rs. 350", { align: "right" })
      .moveDown()
      .text("Thank you!", { align: "center" });

    doc.end();

    writeStream.on("finish", resolve);
    writeStream.on("error", reject);
  });

  // Optional: list available printers
  const printers = await getPrinters();
  console.log("Available Printers:");
  printers.forEach((printer) => console.log(`- ${printer.name}`));

  // Step 2: Print the PDF
  try {
    await print(filePath, { printer: "XP-80C" });
    console.log("Print job sent.");
  } catch (err) {
    console.error("Print error:", err);
  }

  // Step 3: Delete the PDF file
  try {
    fs.unlinkSync(filePath);
    console.log("Temporary PDF deleted.");
  } catch (err) {
    console.error("Error deleting PDF:", err);
  }
};

module.exports = printInvoiceService;
