require("dotenv").config();
const express = require("express");
const connectDB = require("./config/database");
const createHttpError = require("http-errors");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();

// Database connection
connectDB();

// Configuration
const PORT = process.env.PORT || 8000;
const allowedOrigins = [
  "http://localhost:5173",
  "https://pos-wine-two.vercel.app",
];

// Enhanced CORS configuration
const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization'],
  optionsSuccessStatus: 200
};

// Apply CORS middleware
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Request logging for debugging
app.use((req, res, next) => {
  console.log(`Incoming ${req.method} request to ${req.path}`);
  next();
});

// Standard middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

// API Routes
app.use("/user", require("./routes/userRoute")); // Ensure this route file exists
app.use("/order", require("./routes/orderRoute"));
app.use("/table", require("./routes/tableRoute"));
app.use("/payments", require("./routes/paymentRoute"));
app.use("/category", require("./routes/categoryRoute"));
app.use("/dish", require("./routes/dishesRoute"));
app.use("/report", require("./routes/reportRoute"));

// Error handling
app.use((req, res, next) => {
  next(createHttpError.NotFound());
});

app.use((err, req, res, next) => {
  res.status(err.status || 500).json({
    error: {
      status: err.status || 500,
      message: err.message
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});