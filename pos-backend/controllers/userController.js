const createHttpError = require("http-errors");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const config = require("../config/config");

const register = async (req, res, next) => {
    try {
        console.log("=== REGISTER REQUEST ===");
        console.log("Complete request:", {
            headers: req.headers,
            body: req.body
        });

        // Validate request body structure
        if (!req.body || typeof req.body !== 'object') {
            console.error('Invalid request body format');
            throw createHttpError(400, "Invalid request format");
        }

        const { name, phone, email, password, role } = req.body;
        console.log("Extracted fields:", { name, phone, email, role });

        // Validate required fields
        const requiredFields = ['name', 'phone', 'email', 'password', 'role'];
        const missingFields = requiredFields.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            console.error('Missing fields:', missingFields);
            throw createHttpError(400, `Missing required fields: ${missingFields.join(', ')}`);
        }

        // Check for existing user
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.error('User already exists:', email);
            throw createHttpError(400, "User already exists");
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        console.log('Password hashed successfully');

        // Create new user
        const newUser = new User({
            name,
            phone,
            email,
            password: hashedPassword,
            role
        });

        await newUser.save();
        console.log('User created successfully:', newUser._id);

        // Respond
        res.status(201).json({ 
            success: true, 
            message: "User registered successfully",
            data: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (error) {
        console.error('Registration error:', {
            message: error.message,
            stack: error.stack,
            ...(error.response && { response: error.response })
        });
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

    console.log("=== PASSWORD INPUT ===", password);
console.log("=== PASSWORD DB ===", isUserPresent.password);


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
