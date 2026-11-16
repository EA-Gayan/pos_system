const PDFDocument = require("pdfkit");
const fs = require("fs");
const path = require("path");

// A5 portrait (half of A4), in PDF points
const PAGE = { width: 419.53, height: 595.28 };
const M = 28; // page margin
const W = PAGE.width - M * 2; // content width

const COLORS = {
  text: "#1f1f1f",
  muted: "#6b6b6b",
  line: "#d9d9d9",
  fill: "#f4f4f4",
  accent: "#b37f00",
};

const LOGO = path.join(__dirname, "..", "public", "images", "logo-modified.png");
const SINHALA_FONT = path.join(__dirname, "..", "public", "fonts", "NotoSansSinhala-Regular.ttf");
const SINHALA_BOLD = path.join(__dirname, "..", "public", "fonts", "NotoSansSinhala-Bold.ttf");
const HAS_SINHALA = /[඀-෿]/;

const MAX_EARNING_ROWS = 4;
const MAX_DEDUCTION_ROWS = 7;

const money = (n) =>
  `Rs. ${Number(n || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const parse = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const prettyDate = (s) =>
  parse(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
const shortDate = (s) =>
  parse(s).toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
const monthLabel = (month) =>
  parse(`${month}-01`).toLocaleDateString("en-GB", { month: "long", year: "numeric" });
const days = (n) => String(Number(n || 0));

/**
 * Build an A5 salary slip PDF.
 * @param {object} details  output of loadEmployeeDetails() in employeeController
 * @param {object} period   { month, start, end, asOf }
 * @returns {Promise<Buffer>}
 */
const generatePayslip = (details, period) =>
  new Promise((resolve, reject) => {
    // Bottom margin 0 so the pinned footer never spills onto a second page
    const doc = new PDFDocument({
      size: "A5",
      margins: { top: M, left: M, right: M, bottom: 0 },
    });
    const chunks = [];
    doc.on("data", (c) => chunks.push(c));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    const hasSinhalaFonts = fs.existsSync(SINHALA_FONT) && fs.existsSync(SINHALA_BOLD);
    if (hasSinhalaFonts) {
      doc.registerFont("Sinhala", SINHALA_FONT);
      doc.registerFont("Sinhala-Bold", SINHALA_BOLD);
    }
    // Helvetica can't draw Sinhala — switch fonts for names/notes that use it
    const font = (text, bold = false) =>
      hasSinhalaFonts && HAS_SINHALA.test(text || "")
        ? bold ? "Sinhala-Bold" : "Sinhala"
        : bold ? "Helvetica-Bold" : "Helvetica";

    const ms = details.monthSummary;
    const prev = details.previousSummary;
    const periodTo = [period.end, period.asOf, details.endDate].filter(Boolean).sort()[0];
    const periodFrom = [period.start, details.joinDate].sort().pop();
    const isPartial = period.end > period.asOf;

    let y = M;

    const hr = (gap = 8) => {
      doc.moveTo(M, y).lineTo(M + W, y).lineWidth(0.6).strokeColor(COLORS.line).stroke();
      y += gap;
    };

    // Left label + right-aligned value on one line
    const row = (left, right, { size = 8.5, bold = false, color = COLORS.text, middle } = {}) => {
      doc.fillColor(color).fontSize(size);
      doc.font(font(left, bold)).text(left, M, y, { width: W * 0.5, lineBreak: false, ellipsis: true });
      if (middle) {
        doc.font("Helvetica").fillColor(COLORS.muted)
          .text(middle, M + W * 0.42, y, { width: W * 0.3, lineBreak: false });
      }
      doc.font(bold ? "Helvetica-Bold" : "Helvetica").fillColor(color)
        .text(right, M + W * 0.6, y, { width: W * 0.4, align: "right", lineBreak: false });
      y += size + 6;
    };

    const sectionTitle = (title) => {
      doc.font("Helvetica-Bold").fontSize(7.5).fillColor(COLORS.muted)
        .text(title.toUpperCase(), M, y, { characterSpacing: 0.6, lineBreak: false });
      y += 13;
    };

    /* ---------------- Header ---------------- */
    let textX = M;
    try {
      if (fs.existsSync(LOGO)) {
        doc.image(LOGO, M, y - 2, { width: 34 });
        textX = M + 42;
      }
    } catch {
      // logo is optional
    }
    doc.font("Helvetica-Bold").fontSize(14).fillColor(COLORS.text)
      .text("Jayanthi Hotel", textX, y, { lineBreak: false });
    doc.font("Helvetica").fontSize(8).fillColor(COLORS.muted)
      .text("Salary Slip", textX, y + 18, { lineBreak: false });

    doc.font("Helvetica-Bold").fontSize(11).fillColor(COLORS.accent)
      .text(monthLabel(period.month), M, y + 1, { width: W, align: "right", lineBreak: false });
    doc.font("Helvetica").fontSize(7.5).fillColor(COLORS.muted)
      .text(`Issued ${prettyDate(period.asOf)}`, M, y + 18, { width: W, align: "right", lineBreak: false });
    y += 40;
    hr(10);

    /* ---------------- Employee ---------------- */
    doc.font("Helvetica").fontSize(7.5).fillColor(COLORS.muted).text("EMPLOYEE", M, y, { lineBreak: false });
    doc.text("PAY PERIOD", M, y, { width: W, align: "right", lineBreak: false });
    y += 11;
    doc.font(font(details.name, true)).fontSize(12).fillColor(COLORS.text)
      .text(details.name, M, y, { width: W * 0.6, lineBreak: false, ellipsis: true });
    const periodText = ms.calendarDays > 0
      ? `${shortDate(periodFrom)} – ${prettyDate(periodTo)}`
      : "No days in this period";
    doc.font("Helvetica").fontSize(9).text(periodText, M, y + 2, { width: W, align: "right", lineBreak: false });
    y += 24;

    /* ---------------- Attendance boxes ---------------- */
    const boxes = [
      ["Days Counted", days(ms.calendarDays)],
      ["Leave", days(ms.leaveDays)],
      ["Half Days", days(ms.halfDays)],
      ["Working Days", days(ms.workingDays)],
    ];
    const gap = 6;
    const bw = (W - gap * 3) / 4;
    boxes.forEach(([label, value], i) => {
      const x = M + i * (bw + gap);
      doc.roundedRect(x, y, bw, 34, 4).fill(COLORS.fill);
      doc.font("Helvetica").fontSize(6.5).fillColor(COLORS.muted)
        .text(label.toUpperCase(), x, y + 6, { width: bw, align: "center", lineBreak: false });
      doc.font("Helvetica-Bold").fontSize(12).fillColor(i === 3 ? COLORS.accent : COLORS.text)
        .text(value, x, y + 16, { width: bw, align: "center", lineBreak: false });
    });
    y += 40;

    // Leave dates (only days already counted)
    const marked = details.attendance.filter((a) => a.date >= periodFrom && a.date <= periodTo);
    const leaves = marked.filter((a) => a.status === "leave").map((a) => Number(a.date.slice(8)));
    const halves = marked.filter((a) => a.status === "half-day").map((a) => Number(a.date.slice(8)));
    if (leaves.length || halves.length) {
      const mon = parse(`${period.month}-01`).toLocaleDateString("en-GB", { month: "short" });
      const parts = [];
      if (leaves.length) parts.push(`Leave: ${leaves.join(", ")} ${mon}`);
      if (halves.length) parts.push(`Half day: ${halves.join(", ")} ${mon}`);
      doc.font("Helvetica").fontSize(7.5).fillColor(COLORS.muted)
        .text(parts.join("   ·   "), M, y, { width: W });
      y = doc.y + 6;
    }
    y += 4;

    /* ---------------- Earnings ---------------- */
    sectionTitle("Earnings");
    const segments = ms.rateBreakdown || [];
    if (segments.length === 0) {
      row("No working days in this period", money(0), { color: COLORS.muted });
    } else {
      segments.slice(0, MAX_EARNING_ROWS).forEach((s) => {
        row(
          segments.length > 1 ? `${shortDate(s.from)} – ${shortDate(s.to)}` : "Salary",
          money(s.earned),
          { middle: `${days(s.workingDays)} days × ${money(s.dailySalary)}` }
        );
      });
      if (segments.length > MAX_EARNING_ROWS) {
        const rest = segments.slice(MAX_EARNING_ROWS);
        row(`Other periods (${rest.length})`, money(rest.reduce((t, s) => t + s.earned, 0)));
      }
    }
    hr(6);
    row("Total Earned", money(ms.earned), { bold: true });
    y += 4;

    /* ---------------- Deductions ---------------- */
    sectionTitle("Advances & Payments");
    const withdrawals = [...details.withdrawals].sort((a, b) => a.date.localeCompare(b.date));
    if (withdrawals.length === 0) {
      row("None this month", money(0), { color: COLORS.muted });
    } else {
      const shown = withdrawals.length > MAX_DEDUCTION_ROWS
        ? withdrawals.slice(0, MAX_DEDUCTION_ROWS - 1)
        : withdrawals;
      shown.forEach((w) => {
        const kind = w.type === "salary" ? "Salary payment" : "Advance";
        row(`${shortDate(w.date)}  ${kind}${w.note ? ` – ${w.note}` : ""}`, money(w.amount));
      });
      if (shown.length < withdrawals.length) {
        const rest = withdrawals.slice(shown.length);
        row(`Other entries (${rest.length})`, money(rest.reduce((t, w) => t + w.amount, 0)));
      }
    }
    hr(6);
    row("Total Withdrawn", money(ms.withdrawn), { bold: true });
    y += 6;

    /* ---------------- Balance summary ---------------- */
    const showCarry = Math.abs(prev.balance) >= 0.01;
    const totalDue = Math.round((prev.balance + ms.balance) * 100) / 100;
    const boxH = showCarry ? 62 : 34;
    doc.roundedRect(M, y, W, boxH, 5).fill(COLORS.fill);
    const inner = M + 10;
    const innerW = W - 20;
    const line = (label, value, top, { size = 9, bold = false, color = COLORS.text } = {}) => {
      doc.font(bold ? "Helvetica-Bold" : "Helvetica").fontSize(size).fillColor(color);
      doc.text(label, inner, top, { lineBreak: false });
      doc.text(value, inner, top, { width: innerW, align: "right", lineBreak: false });
    };
    if (showCarry) {
      line("Balance this month", money(ms.balance), y + 8, { size: 8.5 });
      line("Brought forward from previous months", money(prev.balance), y + 22, { size: 8.5, color: COLORS.muted });
      line(totalDue < 0 ? "Advance owed by employee" : "Total Balance Payable",
        money(Math.abs(totalDue)), y + 40, { size: 12, bold: true, color: COLORS.accent });
    } else {
      line(totalDue < 0 ? "Advance owed by employee" : "Balance Payable",
        money(Math.abs(totalDue)), y + 11, { size: 12, bold: true, color: COLORS.accent });
    }
    y += boxH + 8;

    if (isPartial) {
      doc.font("Helvetica-Oblique").fontSize(7).fillColor(COLORS.muted)
        .text(`* Month in progress — calculated up to ${prettyDate(period.asOf)}.`, M, y, { width: W });
    }

    /* ---------------- Signatures (pinned to bottom) ---------------- */
    const sigY = PAGE.height - M - 30;
    const sigW = W * 0.4;
    [["Employer", M], ["Employee", M + W - sigW]].forEach(([label, x]) => {
      doc.moveTo(x, sigY).lineTo(x + sigW, sigY).lineWidth(0.6).strokeColor(COLORS.muted).stroke();
      doc.font("Helvetica").fontSize(7.5).fillColor(COLORS.muted)
        .text(`${label} signature`, x, sigY + 4, { width: sigW, align: "center", lineBreak: false });
    });
    doc.font("Helvetica").fontSize(6.5).fillColor(COLORS.muted)
      .text("This is a computer-generated salary slip.", M, PAGE.height - M - 6,
        { width: W, align: "center", lineBreak: false });

    doc.end();
  });

module.exports = generatePayslip;
