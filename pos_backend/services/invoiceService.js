const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");
const sinhalaTextToImage = require("./sinhalaTextImage");

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
        const logoWidth = 60;
        const xCenter = (doc.page.width - logoWidth) / 2;
        doc.image(logoPath, xCenter, doc.y, { width: logoWidth }).moveDown(5);
      }
    } catch (err) {
      console.log("Logo not found, skipping...");
    }

    // === CENTERED HEADER ===
    // === CENTERED HEADER (Sinhala as Image) ===
    const titleImage = sinhalaTextToImage("ජයන්ති හෝටලය", {
      fontSize: 28,
      width: 300,
    });

    const thanksImage = sinhalaTextToImage("ඔබගේ ඇණවුමට ස්තූතියි!", {
      fontSize: 14,
      width: 300,
    });

    doc.image(titleImage, {
      align: "center",
    });

    doc.moveDown(0.3);

    doc.image(thanksImage, {
      align: "center",
    });

    doc.moveDown(1);

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

    // === DATE & FAREWELL SECTION ===
    const formattedDate = new Date(order.orderDate).toLocaleString("en-LK", {
      dateStyle: "medium",
      timeStyle: "short",
      hour12: true,
    });

    // Draw line above
    doc
      .moveTo(50, doc.y)
      .lineTo(doc.page.width - 50, doc.y)
      .stroke();

    doc.moveDown(0.5);

    // Print formatted date
    doc
      .font("Helvetica")
      .text(formattedDate, { align: "center" })
      .moveDown(0.5);

    // Print farewell message
    const byeImage = sinhalaTextToImage("නැවත හමුවෙමු!", {
      fontSize: 16,
      width: 250,
    });

    doc.image(byeImage, {
      align: "center",
    });

    doc.moveDown(0.5);

    // Draw line below
    doc
      .moveTo(50, doc.y)
      .lineTo(doc.page.width - 50, doc.y)
      .stroke();

    doc.moveDown(1); // optional extra space after

    doc.end();
  });
};

module.exports = printInvoiceService;
