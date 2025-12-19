const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

const printInvoiceService = async (order) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: [210, 800],
        margins: { top: 10, bottom: 10, left: 10, right: 10 },
      });

      const chunks = [];
      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      /* ================= FONT ================= */
      const fontPath = path.join(
        process.cwd(),
        "public",
        "fonts",
        "iskpota.ttf"
      );

      let SIN_FONT = "Helvetica";

      if (fs.existsSync(fontPath)) {
        doc.registerFont("IskoolaPota", fontPath);
        SIN_FONT = "IskoolaPota";
      } else {
        console.warn("Iskoola Pota font not found. Using Helvetica.");
      }

      /* ================= LOGO ================= */
      const logoPath = path.join(
        process.cwd(),
        "public",
        "images",
        "logo-modified.png"
      );

      if (fs.existsSync(logoPath)) {
        const logoWidth = 60;
        const x = (doc.page.width - logoWidth) / 2;
        doc.image(logoPath, x, doc.y, { width: logoWidth });
        doc.moveDown(1);
      }

      /* ================= HEADER (SINHALA) ================= */
      doc.font(SIN_FONT).fontSize(18).text("ජයන්ති හෝටලය", {
        align: "center",
        lineGap: 2,
      });

      doc.font(SIN_FONT).fontSize(9).text("ඔබගේ ඇණවුමට ස්තූතියි!", {
        align: "center",
        lineGap: 2,
      });

      doc.moveDown(0.8);
      drawLine(doc);

      /* ================= ORDER INFO ================= */
      doc.font("Helvetica-Bold").fontSize(9).text("Order ID");

      doc.font("Helvetica").fontSize(9).text(order.orderId);

      drawLine(doc);

      /* ================= ITEMS ================= */
      doc.font("Helvetica-Bold").fontSize(10).text("Items Ordered");

      doc.moveDown(0.4);

      order.items.forEach((item) => {
        doc
          .font("Helvetica")
          .fontSize(9)
          .text(`${item.name} x${item.quantity}`, {
            align: "left",
          });

        doc
          .font("Helvetica")
          .fontSize(9)
          .text(`Rs ${item.price.toFixed(2)}`, {
            align: "right",
          });

        doc.moveDown(0.2);
      });

      drawLine(doc);

      /* ================= TOTALS ================= */
      doc
        .font("Helvetica")
        .fontSize(9)
        .text(`Subtotal: Rs ${order.bills.total.toFixed(2)}`, {
          align: "right",
        });

      doc
        .font("Helvetica")
        .fontSize(9)
        .text(`Tax: Rs ${order.bills.tax.toFixed(2)}`, {
          align: "right",
        });

      doc.moveDown(0.3);

      doc
        .font("Helvetica-Bold")
        .fontSize(10)
        .text(`Grand Total: Rs ${order.bills.totalPayable.toFixed(2)}`, {
          align: "right",
        });

      /* ================= DATE ================= */
      doc.moveDown(0.6);
      drawLine(doc);

      const formattedDate = new Date(order.orderDate).toLocaleString("en-LK", {
        dateStyle: "medium",
        timeStyle: "short",
        hour12: true,
      });

      doc
        .font("Helvetica")
        .fontSize(8)
        .text(formattedDate, { align: "center" });

      /* ================= FAREWELL (SINHALA) ================= */
      doc.moveDown(0.4);

      doc.font(SIN_FONT).fontSize(10).text("නැවත හමුවෙමු!", {
        align: "center",
        lineGap: 2,
      });

      drawLine(doc);

      doc.end();
    } catch (err) {
      console.error("Invoice error:", err);
      reject(err);
    }
  });
};

/* ================= HELPER ================= */
function drawLine(doc) {
  doc
    .moveDown(0.4)
    .moveTo(10, doc.y)
    .lineTo(doc.page.width - 10, doc.y)
    .stroke()
    .moveDown(0.4);
}

module.exports = printInvoiceService;
