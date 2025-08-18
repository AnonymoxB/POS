    require("dotenv").config();
    const express = require("express");
    const connectDB = require("./config/database");
    const globalErrorHandler = require("./middlewares/globalErrorHandler");
    const createHttpError = require("http-errors");
    const cookieParser = require("cookie-parser");
    const cors = require("cors");
    const app = express();
    const qrisRoute = require("./routes/qrisRoute");
    const reportRoutes = require('./routes/reportRoute');



    const PORT = process.env.PORT;
    connectDB();

    // Middleware

    const allowedOrigins = [
    "http://localhost:5173",
    "https://pos-wine-two.vercel.app",
    ];

    app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        } else {
        callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
    }));

    // Jangan lupa ini juga
    app.options("*", cors());

    app.use(express.json());
    app.use(cookieParser());



    // Root
    app.get("/", (req, res) => {

        // const err = createHttpError(404, "Something went wrong !");
        // throw err;

        res.json({message: "Hello from POS Server !"});
    })

    // other endpoint

    app.use("/api/user", require("./routes/userRoute"));
    app.use("/api/order", require("./routes/orderRoute"));
    app.use("/api/table", require("./routes/tableRoute")) ;
    app.use("/api/payments", require("./routes/paymentRoute"));
    app.use("/api/category", require("./routes/categoryRoute"));
    app.use("/api/dish", require("./routes/dishesRoute"));

    //QRIS
    // app.use('/api/qris', qrisRoute);

    //report
    
    app.use('/api/report', require("./routes/reportRoute"));
    // app.use('/api/reports', reportRoutes)
    
    

    // Global error handle
    app.use(globalErrorHandler);

    // Server
    // app.listen(PORT, () => {
    //     console.log(`POS Server is listening on port ${PORT}`);

    
    // })
    module.exports = app;