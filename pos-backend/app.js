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

// Daftar origin yang diizinkan
const allowedOrigins = [
  "https://pos-wine-two.vercel.app",
  "http://localhost:5173",
];

// Middleware global untuk logging origin
app.use((req, res, next) => {
  console.log("👉 Origin:", req.headers.origin, " Method:", req.method);
  next();
});

// Middleware CORS
const corsOptions = {
  origin: (origin, callback) => {
    // request tanpa origin (Postman, curl) langsung allow
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) return callback(null, true);

    console.warn("❌ Blocked by CORS:", origin);
    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
};
app.use(cors(corsOptions));

// Preflight OPTIONS
app.options("*", cors(corsOptions));

// Tambahan: set header manual untuk memastikan CORS selalu ada
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  next();
});

// Middleware body parser & cookie
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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

// Start server
app.listen(PORT, () => {
  console.log(`POS Server is listening on port ${PORT}`);
});
