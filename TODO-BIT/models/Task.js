const mongoose = require("mongoose");
const Joi = require("joi")
const Schema = mongoose.Schema;

const taskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        maxLength: 20
    },

    description: {
        type: String,
        required: false,
        maxLength: 50
    },
    completionStatus: {
        type: String,
        required: [true, "Completion Status is Required"],
        maxLength: 10
    },
    image: {
        type: String
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Correct the type declaration
        ref: 'User' // Ensure 'User' matches the name of your User model
    }
});


// Define Joi schema for validation
const validationSchema = Joi.object({
    title: Joi.string().min(3).max(25).regex(/^[a-zA-Z0-9\s]*$/).required(),
    description: Joi.string().max(50).allow(''),
    completionStatus: Joi.string().max(10).required()
});

taskSchema.methods.validateInput = async function () {
    try {
        await validationSchema.validateAsync(this.toObject());
        return true;
    } catch (error) {
        throw error;
    }
};

const Task = mongoose.model("Task", taskSchema);

module.exports = {
    Task,
    validationSchema
};