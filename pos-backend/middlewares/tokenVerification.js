const config = require("../config/config");
const createHttpError = require("http-errors");
const jwt = require("jsonwebtoken");
const User = require("../models/userModel");


const  isVerifiedUser = async (req, res, next) => {
    try {
        
        let token = req.cookies.accessToken;
        if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
        token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
        return next(createHttpError(401, "Please provide token !"));
        }

        const decodeToken = jwt.verify(token, config.accessTokenSecret);

        const user = await User.findById(decodeToken._id);
        if(!user){
            const error = createHttpError(401, "User not exist !");
            return next(error);
        }

        req.user = user;
        next();

    } catch (error) {
        const err = createHttpError(401, "Invalid Token !");
            return next(err);
    }
}

module.exports = {isVerifiedUser}; 