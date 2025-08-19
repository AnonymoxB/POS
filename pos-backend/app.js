require("dotenv").config();
const express = require("express");
const connectDB = require("./config/database");
const globalErrorHandler = require("./middlewares/globalErrorHandler");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

// Database connection
connectDB();

const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// === CORS FIX ===
const allowedOrigins = [
  "https://pos-wine-two.vercel.app",
  "http://localhost:5173"
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin) return callback(null, true); // allow Postman, curl, etc
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("❌ Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));
app.options("*", cors(corsOptions)); // handle preflight

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

// Global error handler
app.use(globalErrorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`✅ POS Server is listening on port ${PORT}`);
});
