require("dotenv").config();
const express = require("express");
const connectDB = require("./config/database");
const globalErrorHandler = require("./middlewares/globalErrorHandler");
const createHttpError = require("http-errors");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();

// Database connection
connectDB();

const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json()); // MUST come first to parse JSON bodies
app.use(express.urlencoded({ extended: true })); // For form data
app.use(cookieParser());

// Enhanced CORS configuration
app.use((req, res, next) => {
  const allowedOrigins = [
    "https://pos-wine-two.vercel.app",
    "http://localhost:5173",
  ];
  const origin = req.headers.origin;

  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }

  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  // respond preflight request
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Hello from POS Server!" });
});

// API Routes
app.use("/api/user", require("./routes/userRoute"));
app.use("/api/order", require("./routes/orderRoute"));
app.use("/api/table", require("./routes/tableRoute"));
app.use("/api/payments", require("./routes/paymentRoute"));
app.use("/api/category", require("./routes/categoryRoute"));
app.use("/api/dish", require("./routes/dishesRoute"));
app.use("/api/report", require("./routes/reportRoute"));

// Global error handler - MUST be last middleware
app.use(globalErrorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`POS Server is listening on port ${PORT}`);
});