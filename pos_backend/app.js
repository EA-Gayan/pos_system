require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/database");
const config = require("./config/config");
const globalErrorHandler = require("./middleware/globalErrorHandler");

const app = express();

app.use(bodyParser.json());

const PORT = config.port;
connectDB(); // Connect to the database

// Middleware
app.use(cors({ credentials: true, origin: ["http://localhost:5173"] })); // Enable CORS with credentials
app.use(express.json()); // Parse JSON requests
app.use(cookieParser()); // Parse cookies

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
app.use("/api/xml", require("./routes/generateXmlRoute"));
app.use("/api/expenses", require("./routes/expensesRoute"));

// Global Error Handler
app.use(globalErrorHandler);

// Server
app.listen(PORT, () => {
  console.log(`POS Server is listening on port ${PORT}`);
});
