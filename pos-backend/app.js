require("dotenv").config({ silent: true }); // Silent mode for dotenv
const express = require("express");
const mongoose = require("mongoose");
const createHttpError = require("http-errors");
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require("helmet"); // Added for security headers
const rateLimit = require("express-rate-limit"); // Added for rate limiting
const app = express();

// Enhanced MongoDB connection with retry and timeout
const connectDB = async () => {
  const maxRetries = 5;
  let retryCount = 0;

  const connectWithRetry = async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
        socketTimeoutMS: 30000,
        retryWrites: true,
        w: "majority"
      });
      console.log('✅ MongoDB connected successfully');
    } catch (err) {
      retryCount++;
      console.error(`❌ MongoDB connection error (attempt ${retryCount}/${maxRetries}):`, err.message);
      
      if (retryCount < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 5000));
        return connectWithRetry();
      } else {
        console.error('🔥 Failed to connect to MongoDB after multiple attempts');
        process.exit(1);
      }
    }
  };

  await connectWithRetry();
};

// Security middleware
app.use(helmet());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(cookieParser());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later"
});
app.use(limiter);

// CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "https://pos-wine-two.vercel.app",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn('🚫 CORS blocked for origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['Authorization'],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

// Enhanced health check
app.get('/health', async (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1;
  const status = dbStatus ? 'OK' : 'Degraded';
  
  res.status(dbStatus ? 200 : 503).json({
    status,
    database: dbStatus ? 'Connected' : 'Disconnected',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage()
  });
});

// API Routes
app.use("/api/user", require("./routes/userRoute"));
app.use("/api/order", require("./routes/orderRoute"));
app.use("/api/table", require("./routes/tableRoute"));
app.use("/api/payments", require("./routes/paymentRoute"));
app.use("/api/category", require("./routes/categoryRoute"));
app.use("/api/dish", require("./routes/dishesRoute"));
app.use("/api/report", require("./routes/reportRoute"));

// Error handling
app.use((req, res, next) => {
  next(createHttpError.NotFound('Endpoint not found'));
});

app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = process.env.NODE_ENV === 'production' && !err.expose 
    ? 'An error occurred' 
    : err.message;

  res.status(status).json({
    error: {
      status,
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

// Server initialization
const server = app.listen(process.env.PORT || 8000, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${process.env.PORT || 8000}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: /health`);
});

// Graceful shutdown
const shutdown = (signal) => {
  console.log(`🛑 Received ${signal}, shutting down gracefully...`);
  
  server.close(async () => {
    console.log('🔒 HTTP server closed');
    
    if (mongoose.connection.readyState === 1) {
      await mongoose.connection.close(false);
      console.log('🔒 MongoDB connection closed');
    }
    
    process.exit(0);
  });

  setTimeout(() => {
    console.error('🕒 Force shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = app;