require("dotenv").config();
const express = require("express");
const connectDB = require("./config/database");
const globalErrorHandler = require("./middlewares/globalErrorHandler");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();
connectDB();

const PORT = process.env.PORT || 8080;

const allowedOrigins = [
  "https://pos-wine-two.vercel.app",
  "http://localhost:5173",
];

// ========= FIX CORS =========
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.header("Access-Control-Allow-Origin", origin);
  }
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ========== Routes ==========
app.get("/", (req, res) => {
  res.json({ message: "Hello from POS Server!" });
});

app.use("/api/user", require("./routes/userRoute"));
app.use("/api/order", require("./routes/orderRoute"));
app.use("/api/table", require("./routes/tableRoute"));
app.use("/api/payments", require("./routes/paymentRoute"));
app.use("/api/category", require("./routes/categoryRoute"));
app.use("/api/dish", require("./routes/dishesRoute"));
app.use("/api/report", require("./routes/reportRoute"));

// Error handler
app.use(globalErrorHandler);

app.listen(PORT, () => {
  console.log(`✅ POS Server running on port ${PORT}`);
});
