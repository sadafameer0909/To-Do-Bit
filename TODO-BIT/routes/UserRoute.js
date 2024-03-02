const mongoose = require("mongoose");
const express = require('express')
const Joi = require("joi")
const router = express.Router();
const { User, validationSchema } = require("../models/User");
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')

router.post("/login", async (request, response) => {
    const { email, password } = request.body;
    try {
        const user = await User.findOne({ email });
        if (user == null) {
             response.status(400).json({ msg: "Wrong Email or Password" });
        } else {
            // Compared the entered password with the hashed password
            const isPasswordMatch = await bcrypt.compare(password, user.password);
            if (!isPasswordMatch) {
                 response.status(400).json({ msg: "Password Does Not Match" });
            } else {
                // If passwords match, created JWT token and send response
                const payload = {
                    email: user.email,
                    id: user._id
                };

                const token = jwt.sign(payload, process.env.SECRET_KEY, { expiresIn: "60m" });

                response.status(200).json({
                    success: true,
                    message: "User Logged in successfully!",
                    token: token
                });
            }
        }
    } catch (error) {
        console.error("Error:", error);
       response.status(500).json({
            success: false,
            message: "Unable to log-in"
        });
    }
});



//save the Tasks, Data entered: fname,lname,email,password.
router.post('/register', async (request, response) => {
    try {
        const reqData = request.body;
        const { error, value } = validationSchema.validate(reqData);

        // If validation fails, return error response
        if (error) {
            return response.status(400).json({ error: error.details[0].message });
        }
        console.log("Validated data:", value);

        const userData = new User(reqData);

        const savedData = await userData.save();

        response.status(201).json({ success:true, message: "User Saved Successfully !!", id: savedData._id });
    } catch (error) {
        if (error.code === 11000 && error.keyPattern.email === 1) {
            response.status(400).json({ error: 'Email already exists' });
        } else {
            console.log(error);
            response.status(500).json({ success:false, msg: "Unable to create new User" });
        }
    }
});


//Retrieve all the Data in the collection
router.get('/get-user-list', async (request, response) => {
    try {

        User.find()
            .then((savedUser) => {
                console.log(savedUser);
                response.status(201).json({ success:true, UserList: savedUser });
            })
            .catch((error) => {
                console.log(error);
                response.status(500).json({ msg: "Unable to get Data" })
            })
    } catch (error) {
        console.log(error);
        response.status(500).json({success:false, message: "Unable to get User List" })
    }
});
router.delete('/delete/:id', async (request, response) => {
    try {

        const id = request.params.id;
        await User.findByIdAndDelete(id)
            .then((delUser) => {
                if (delUser) {
                    console.log(delUser);
                    response.status(201).json({ success:true, message: "Data deleted Successfully", delUser: delUser.id });
                } else {
                    response.status(404).json({ msg: "No user found with the provided ID" });
                }
            }).catch((error) => {
                console.log(error);
                response.status(500).json({ message: "Unable to Delete Data" })
            })
    } catch (error) {
        console.log(error);
        response.status(500).json({ success:false, message: "Unable to Delete Data" })
    }
});


module.exports = router;
