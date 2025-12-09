const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const printInvoiceService = async (order) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({
      size: [210, 800],
      margins: { top: 0, bottom: 10, left: 10, right: 10 },
    });

    const chunks = [];

    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    // === LOGO ===
    const logoPath = path.join(
      __dirname,
      "..",
      "public",
      "images",
      "logo-modified.png"
    );

    try {
      if (fs.existsSync(logoPath)) {
        const logoWidth = 50;
        const xCenter = (doc.page.width - logoWidth) / 2;
        doc.image(logoPath, xCenter, doc.y, { width: logoWidth }).moveDown(5);
      }
    } catch (err) {
      console.log("Logo not found, skipping...");
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

    // Draw separator line ABOVE the date
    doc
      .moveTo(50, doc.y) // start at current y
      .lineTo(doc.page.width - 50, doc.y) // horizontal line
      .stroke();

    doc.moveDown(0.5); // add vertical space

    // Print ONLY the formatted date & time
    doc.font("Helvetica-Bold").text(formattedDate, { align: "left" });

    doc.moveDown(0.5); // space below the date

    // Draw separator line BELOW the date
    doc
      .moveTo(50, doc.y)
      .lineTo(doc.page.width - 50, doc.y)
      .stroke();

    doc.moveDown(1); // optional extra space after

    doc
      .font("Helvetica-Bold")
      .text("See You Again !", doc.page.width / 2 - 30)
      .moveDown(0.5);

    doc.end();
  });
};

module.exports = printInvoiceService;
