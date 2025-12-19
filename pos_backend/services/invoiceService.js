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

      /* ================= FONT SETUP ================= */
      const iskoolaFontPath = path.join(
        process.cwd(),
        "public",
        "fonts",
        "iskpota.ttf"
      );

      let sinhalaFont = "Helvetica"; // fallback

      if (fs.existsSync(iskoolaFontPath)) {
        doc.registerFont("IskoolaPota", iskoolaFontPath);
        sinhalaFont = "IskoolaPota";
      } else {
        console.warn("⚠️ Iskoola Pota font not found, using Helvetica");
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
        const xCenter = (doc.page.width - logoWidth) / 2;
        doc.image(logoPath, xCenter, doc.y, { width: logoWidth });
        doc.moveDown(1);
      }

      /* ================= HEADER ================= */
      doc
        .font(sinhalaFont)
        .fontSize(18)
        .text("ජයන්ති හෝටලය", { align: "center" })
        .moveDown(0.2)
        .fontSize(9)
        .text("ඔබගේ ඇණවුමට ස්තූතියි!", { align: "center" })
        .moveDown(0.8);

      /* ================= ORDER ID ================= */
      drawLine(doc);

      doc
        .font("Helvetica-Bold")
        .fontSize(9)
        .text("Order ID:", { continued: true })
        .font("Helvetica")
        .text(` ${order.orderId}`);

      drawLine(doc);

      /* ================= ITEMS ================= */
      doc
        .moveDown(0.5)
        .font("Helvetica-Bold")
        .fontSize(10)
        .text("Items Ordered")
        .moveDown(0.5);

      order.items.forEach((item) => {
        doc
          .font("Helvetica")
          .fontSize(9)
          .text(`${item.name} x${item.quantity}`, 10, doc.y, {
            continued: true,
          })
          .text(`Rs ${item.price.toFixed(2)}`, { align: "right" });
      });

      /* ================= TOTALS ================= */
      doc.moveDown(0.5);
      drawLine(doc);

      doc
        .font("Helvetica")
        .fontSize(9)
        .text(`Subtotal: Rs ${order.bills.total.toFixed(2)}`, {
          align: "right",
        })
        .text(`Tax: Rs ${order.bills.tax.toFixed(2)}`, {
          align: "right",
        })
        .moveDown(0.3)
        .font("Helvetica-Bold")
        .text(`Grand Total: Rs ${order.bills.totalPayable.toFixed(2)}`, {
          align: "right",
        });

      /* ================= DATE & FAREWELL ================= */
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
        .text(formattedDate, { align: "center" })
        .moveDown(0.4)
        .font(sinhalaFont)
        .fontSize(10)
        .text("නැවත හමුවෙමු!", { align: "center" });

      drawLine(doc);

      doc.end();
    } catch (error) {
      console.error("Invoice generation error:", error);
      reject(error);
    }
  });
};

/* ================= HELPER ================= */
function drawLine(doc) {
  doc
    .moveDown(0.3)
    .moveTo(10, doc.y)
    .lineTo(doc.page.width - 10, doc.y)
    .stroke()
    .moveDown(0.3);
}

module.exports = printInvoiceService;
