require("dotenv").config();
const express = require("express");
const connectDB = require("./config/database");
const globalErrorHandler = require("./middlewares/globalErrorHandler");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

// 🔗 Connect ke MongoDB
connectDB();

const PORT = process.env.PORT || 8080;

// =======================
// Middleware dasar
// =======================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// =======================
// Konfigurasi CORS
// =======================
const allowedOrigins = [
  "https://pos-wine-two.vercel.app",
  "http://localhost:5173",
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error("Not allowed by CORS"), false);
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));

// ✅ Fix tambahan untuk preflight supaya Railway nggak drop
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.header("Access-Control-Allow-Credentials", "true");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200); // langsung bales preflight
  }
  next();
});

// =======================
// Routes
// =======================
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

// =======================
// Global error handler
// =======================
app.use(globalErrorHandler);

// =======================
// Start Server
// =======================
app.listen(PORT, () => {
  console.log(`✅ POS Server is listening on port ${PORT}`);
});
