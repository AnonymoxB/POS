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
    const listEndpoints = require('express-list-endpoints');



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

    app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', true);
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
    });

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

    app.use("/user", require("./routes/userRoute"));
    app.use("/order", require("./routes/orderRoute"));
    app.use("/table", require("./routes/tableRoute")) ;
    app.use("/payments", require("./routes/paymentRoute"));
    app.use("/category", require("./routes/categoryRoute"));
    app.use("/dish", require("./routes/dishesRoute"));

    //QRIS
    // app.use("/payment", qrisRoutes);

    //report
    
    app.use('/report', require("./routes/reportRoute"));
    // app.use('/reports', reportRoutes)
    
    

    // Global error handle
    app.use(globalErrorHandler);

    // Server
    // app.listen(PORT, () => {
    //     console.log(`POS Server is listening on port ${PORT}`);

    
    // })
    console.log(listEndpoints(app));
    module.exports = app;