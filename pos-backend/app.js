require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const createHttpError = require("http-errors");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();

// Enhanced error handling at process level
process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION! 💥', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('UNHANDLED REJECTION! 💥', err);
  process.exit(1);
});

// Database connection with retry logic
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    console.log('MongoDB connected successfully');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    setTimeout(connectDB, 5000); // Retry after 5 seconds
  }
};
connectDB();

// Configuration
const PORT = process.env.PORT || 8000; // Railway often prefers 8000

const allowedOrigins = [
  "http://localhost:5173",
  "https://pos-wine-two.vercel.app",
];

// Robust CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('CORS blocked for origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization'],
  optionsSuccessStatus: 200,
  maxAge: 86400 // 24 hours
};

// Middlewares
app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Expose-Headers', 'Authorization, X-Total-Count');
  next();
});

app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Enhanced health check endpoint
app.get('/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1;
  const healthCheck = {
    status: dbStatus ? 'OK' : 'Degraded',
    timestamp: new Date().toISOString(),
    database: dbStatus ? 'Connected' : 'Disconnected',
    memoryUsage: process.memoryUsage(),
    uptime: process.uptime()
  };
  res.status(dbStatus ? 200 : 503).json(healthCheck);
});

// Root endpoint
app.get("/", (req, res) => {
  res.json({
    message: "POS Server API",
    version: "1.0.0",
    status: "Operational",
    environment: process.env.NODE_ENV || 'development',
    docs: "https://github.com/AnonymoxB/POS"
  });
});

// API Routes
app.use("/api/user", require("./routes/userRoute")); // Added /api prefix for consistency
app.use("/api/order", require("./routes/orderRoute"));
app.use("/api/table", require("./routes/tableRoute"));
app.use("/api/payments", require("./routes/paymentRoute"));
app.use("/api/category", require("./routes/categoryRoute"));
app.use("/api/dish", require("./routes/dishesRoute"));
app.use("/api/report", require("./routes/reportRoute"));

// 404 Handler
app.use((req, res, next) => {
  next(createHttpError.NotFound('Endpoint not found'));
});

// Error handler
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production' 
    ? err.expose ? err.message : 'An error occurred'
    : err.message;

  res.status(status).json({
    error: {
      status,
      message,
      ...(process.env.NODE_ENV === 'development' && {
        stack: err.stack,
        details: err
      })
    }
  });
});

// Server initialization with graceful shutdown
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log("🛣️ Available routes:");
  console.log(listEndpoints(app));
});

// Graceful shutdown
const shutdown = () => {
  console.log('🛑 Received shutdown signal');
  server.close(async () => {
    console.log('🔒 HTTP server closed');
    await mongoose.connection.close();
    console.log('🔒 Database connection closed');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

module.exports = app;