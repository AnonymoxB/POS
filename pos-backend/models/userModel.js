const mongoose = require("mongoose");
const bcrypt = require("bcrypt");


const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },

    email: {
        type: String,
        required: true,
        validate: {
            validator: function (v) {
                return /\S+@\S+\.\S+/.test(v);
            },
            message: props => `${props.value} Email must be in valid format`
        }
    },

    phone: {
        type: String,
        required: true,
        trim: true,
        validate: {
            validator: function (v) {
            return /^(\+62|0)[0-9]{9,13}$/.test(v); // validasi untuk nomor Indonesia
            },
            message: props => `${props.value} is not a valid phone number!`
        }
    },

    password: {
        type: String,
        required: true,
    },

    role: {
        type: String,
        required: true,
    }

}, {
    timestamps : true
})

userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        return next();
    }
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

module.exports = mongoose.model("User", userSchema);