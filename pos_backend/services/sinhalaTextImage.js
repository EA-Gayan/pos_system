const { createCanvas, registerFont } = require("canvas");
const path = require("path");

const fontPath = path.join(process.cwd(), "public", "fonts", "iskpota.ttf");

// Register font ONCE
registerFont(fontPath, { family: "IskoolaPota" });

function sinhalaTextToImage(text, options = {}) {
  const { fontSize = 24, padding = 10, width = 400 } = options;

  const canvas = createCanvas(width, fontSize + padding * 2);
  const ctx = canvas.getContext("2d");

  // White background
  ctx.fillStyle = "#FFFFFF";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Text
  ctx.fillStyle = "#000000";
  ctx.font = `${fontSize}px IskoolaPota`;
  ctx.textBaseline = "middle";

  ctx.fillText(text, padding, canvas.height / 2);

  return canvas.toBuffer("image/png");
}

module.exports = sinhalaTextToImage;
