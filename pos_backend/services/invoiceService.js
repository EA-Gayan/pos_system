const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const { print } = require("pdf-to-printer");

const printInvoiceService = async (order) => {
  const filePath = path.join(__dirname, "invoice.pdf");

  // Step 1: Create PDF
  await new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: [210, 800], // 80mm width, dynamic height
      margins: { top: 0, bottom: 10, left: 10, right: 10 },
    });

    const writeStream = fs.createWriteStream(filePath);
    doc.pipe(writeStream);

    const logoPath = path.join(
      __dirname,
      "..",
      "public",
      "images",
      "logo-modified.png"
    );
    if (fs.existsSync(logoPath)) {
      const logoWidth = 55;
      const xCenter = (doc.page.width - logoWidth) / 2;
      doc.image(logoPath, xCenter, doc.y, { width: logoWidth }).moveDown(5);
    }

    // === CENTERED HEADER ===
    doc
      .fontSize(18)
      .font("Helvetica-Bold")
      .text("Jayanthi Hotel", { align: "center" })
      .fontSize(9)
      .font("Helvetica")
      .text("Thank you for your order!", { align: "center" })
      .moveDown(1);

    // === ORDER ID ===
    doc
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke()
      .moveDown(0.5)
      .font("Helvetica-Bold")
      .text("Order ID:", { continued: true })
      .font("Helvetica")
      .text(` ${order.orderId}`)
      .moveDown(0.5)
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke()
      .moveDown();

    // === ITEMS ===
    doc.font("Helvetica-Bold").text("Items Ordered").moveDown(0.5);

    order.items.forEach((item) => {
      const itemText = `${item.name} x${item.quantity}`;
      doc
        .font("Helvetica")
        .text(itemText, 50, doc.y, { continued: true })
        .text(`Rs ${item.price.toFixed(2)}`, { align: "right" });
    });

    // === TOTALS ===
    doc
      .moveDown()
      .moveTo(50, doc.y)
      .lineTo(550, doc.y)
      .stroke()
      .moveDown(0.5)
      .font("Helvetica")
      .text(`Subtotal: Rs ${order.bills.total.toFixed(2)}`, { align: "right" })
      .text(`Tax: Rs ${order.bills.tax.toFixed(2)}`, { align: "right" })
      .moveDown(0.5)
      .font("Helvetica-Bold")
      .text(`Grand Total: Rs ${order.bills.totalPayable.toFixed(2)}`, {
        align: "right",
      })
      .moveDown(0.5);

    // === DATE & TIME ===
    const formattedDate = new Date(order.orderDate).toLocaleString("en-LK", {
      dateStyle: "medium",
      timeStyle: "short",
      hour12: true,
    });

    const leftMargin = doc.page.margins.left;

    doc
      .moveTo(50, doc.y)
      .stroke()
      .moveDown(0.5)
      .font("Helvetica-Bold")
      .text("Date & Time:", { continued: true })
      .font("Helvetica")
      .text(` ${formattedDate}`, leftMargin)
      .moveDown(0.5)
      .moveTo(50, doc.y)
      .stroke()
      .moveDown();

    doc
      .font("Helvetica-Bold")
      .text("See You Again !", doc.page.width / 2 - 30)
      .moveDown(0.5);

    doc.end();

    writeStream.on("finish", resolve);
    writeStream.on("error", reject);
  });

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
