require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/database");
const config = require("./config/config");
const globalErrorHandler = require("./middleware/globalErrorHandler");

const app = express();

const path = require("path");
app.get("/favicon.ico", (req, res) => res.status(204).end());
app.get("/favicon.png", (req, res) => {
  res.sendFile(path.join(__dirname, "favicon.png"));
});

app.use(bodyParser.json());

const PORT = config.port;
connectDB(); // Connect to the database

// Middleware
app.use(
  cors({
    credentials: true,
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:5173",
        "https://jayanthi-hotel-self.vercel.app",
        process.env.FRONTEND_URL,
      ];

      // Allow requests with no origin (like mobile apps or Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
  })
);
app.use(express.json()); // Parse JSON requests
app.use(cookieParser()); // Parse cookies
app.use(express.static("public"));

// Root Endpoint
app.get("/", (req, res) => {
  res.json({ message: "Hello from POS Server!" });
});

// Other Endpoints
app.use("/api/user", require("./routes/userRoute"));
app.use("/api/order", require("./routes/orderRoute"));
app.use("/api/table", require("./routes/tableRoute"));
app.use("/api/category", require("./routes/categoryRoute"));
app.use("/api/product", require("./routes/productRoute"));
app.use("/api/dashboard", require("./routes/dashboardRoute"));
app.use("/api/report", require("./routes/generateXmlRoute"));
app.use("/api/expenses", require("./routes/expensesRoute"));
app.use("/api/print", require("./routes/printInvoiceRoute"));

//Cron job endpoints
app.use("/api/cron", require("./routes/cronRoute"));

// Global Error Handler
app.use(globalErrorHandler);

// Only start server if not in Vercel (not being imported)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`POS Server is listening on port ${PORT}`);
  });
}

// Export for Vercel
module.exports = app;
