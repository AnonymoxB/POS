require("dotenv").config();
const express = require("express");
const connectDB = require("./config/database");
const createHttpError = require("http-errors");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();

// Import routes
const qrisRoute = require("./routes/qrisRoute");
const reportRoutes = require('./routes/reportRoute');
const listEndpoints = require('express-list-endpoints');

// Database connection
connectDB();

// Configuration
const PORT = process.env.PORT || 8000; // Fallback port

const allowedOrigins = [
  "http://localhost:5173",
  "https://pos-wine-two.vercel.app",
];

// Enhanced CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin in development
    if (!origin && process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  optionsSuccessStatus: 200 // For legacy browser support
};

// Middlewares
app.use(cors(corsOptions));
app.options('*', cors(corsOptions)); // Enable preflight for all routes

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Expose-Headers', 'Authorization'); // Important for JWT
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Health check endpoint (required for Railway)
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK',
    timestamp: new Date().toISOString()
  });
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "POS Server API",
    version: "1.0.0",
    docs: "https://github.com/AnonymoxB/POS"
  });
});

// API Routes
app.use("/user", require("./routes/userRoute"));
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
  res.status(err.status || 500);
  res.json({
    error: {
      status: err.status || 500,
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    }
  });
});

// Server initialization
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log("Available routes:");
  console.log(listEndpoints(app));
});

// Handle shutdown gracefully
process.on('SIGTERM', () => {
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

module.exports = app;