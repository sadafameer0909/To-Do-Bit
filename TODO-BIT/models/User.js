const mongoose = require("mongoose");
const Joi = require("joi")
const bcrypt = require('bcrypt')


const userSchema = new mongoose.Schema({
    fname: {
        type: String,
        required: true,
        empty: false,
        maxLength: 20
    },
    lname: {
        type: String,
        required: true,
        maxLength: 20
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,

    }
});
//Hash password using BCRYPT 

userSchema.pre('save', async function (next) {
    try {
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(this.password, salt)
        this.password = hashedPassword;

        next()
    } catch (error) {
        next(error)
    }
})

// Define Joi schema for validation
const validationSchema = Joi.object({
    fname: Joi.string().min(1).max(25).empty('').pattern(/^[a-zA-Z]+$/).required(),
    lname: Joi.string().min(1).max(25).empty('').required().pattern(/^[a-zA-Z]+$/),
    email: Joi.string().email().empty('').required(),
    password: Joi.string()
        .min(6)
        .max(12)
        .empty('')
        .required()
        .pattern(/^(?=.*[a-zA-Z])(?=.*[0-9])(?=.*[\W_]).{6,12}$/)
        .message('Password must be alphanumeric with at least one numeric and one special character, and between 6 and 12 characters in length.')

});

userSchema.methods.validateInput = async function () {
    try {
        await validationSchema.validateAsync(this.toObject());
        return true;
    } catch (error) {
        throw error;
    }
};

const User = mongoose.model("User", userSchema);

module.exports = {
    User,
    validationSchema
};