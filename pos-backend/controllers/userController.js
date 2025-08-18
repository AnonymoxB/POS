const createHttpError = require("http-errors");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config/config");

const register = async (req, res, next) => {
    try {

        console.log("=== REGISTER BODY ===");
        console.log("Headers:", req.headers["content-type"]);
        console.log("Body:", req.body);

        const { name, phone, email, password, role } = req.body;

        // Cek input
        if (!name || !phone || !email || !password || !role) {
            const error = createHttpError(400, "All fields are required !");
            return next(error);
        }

        // Cek email sudah digunakan
        const isUserPresent = await User.findOne({ email });
        if (isUserPresent) {
            const error = createHttpError(400, "User already exists");
            return next(error);
        }

        const user = { name, phone, email, password, role };
        const newUser = new User(user);
        await newUser.save();

        res.status(201).json({ success: true, message: "New user created!", data: newUser });

    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
   
    try {

        const {email, password} = req.body;
        console.log("=== LOGIN BODY ===", req.body);

        if (!email || !password){
            const error = createHttpError(400, "All fields are required !");
            return next(error);
        }

        const isUserPresent = await User.findOne({ email });
         console.log("=== USER ===", isUserPresent);
        if (!isUserPresent) {
        const error = createHttpError(401, "Invalid Credentials");
        return next(error);
        }

        
        const isMatch = await bcrypt.compare(password, isUserPresent.password);
        if (!isMatch) {
        const error = createHttpError(401, "Invalid Credentials");
        return next(error);
        }
         console.log("=== CONFIG SECRET ===", config.accessTokenSecret);
        const accessToken = jwt.sign({_id: isUserPresent._id}, config.accessTokenSecret, {
            expiresIn: '1d'
        });

        res.cookie('accessToken', accessToken, {
            maxAge: 1000 *60 *60 *24 *30,
            httpOnly: true,
            sameSite: 'none',
            secure: true
        });

        res.status(200).json({success: true, message:"User login successfully !", 
            data: isUserPresent,
            token: accessToken
        });

        
    } catch (error) {
        return next(error);
    }

};

const getUserData = async(req, res, next) => {
    try {
        
        const user = await User.findById(req.user._id);
        res.status(200).json({success: true, data: user});

    } catch (error) {
        return next(error);
    }
}

const logout = async(req, res, next) => {
    try {
        res.clearCookie('accessToken');
        res.status(200).json({success: true, message: "User logout successfully !"});
    } catch (error) {
        return next(error);
    }
}

module.exports = { register, login, getUserData, logout };
