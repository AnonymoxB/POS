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

const allowedOrigins = [
  "https://pos-wine-two.vercel.app",
  "http://localhost:5173",
];

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// 🔑 Konfigurasi CORS sekali aja
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use((req, res, next) => {
  console.log("👉 Origin:", req.headers.origin, " Method:", req.method);
  next();
});

app.use(cors(corsOptions));

// Pastikan preflight OPTIONS dijawab
app.options("*", cors(corsOptions));

// Routes
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
  console.log(`POS Server is listening on port ${PORT}`);
});
