const express = require('express')
const router = express.Router();
const { Task, validationSchema } = require("../models/Task");
const multer = require('multer');
const path = require('path')
const Joi = require("joi");
const fs = require('fs')
const passport = require('passport');
require('../configurations/passportConfig')


router.use(passport.initialize());// use Passport middleware

const upload = multer({
    storage: multer.diskStorage({
        destination: function (request, file, cb) {
            cb(null, "uploads")
        },
        filename: function (request, file, cb) {
            cb(null, file.fieldname + "-" + Date.now() + ".jpg")
        }
    })
}).single("image")


//save the Tasks, Data entered: title, description, completion status, image.

router.post('/save',upload, passport.authenticate('jwt', { session: false }) , async (request, response) => {
    try {
        // Validate request body against the Joi schema
        const { error, value } = validationSchema.validate(request.body);

        if (error) {
            return response.status(400).json({ error: error.details[0].message });
        }


        const userid = request.user._id;
        const newTask = {
            title: request.body.title,
            description: request.body.description,
            completionStatus: request.body.completionStatus,
           userId:userid
        };
        if(request.file!=undefined)
       newTask.image = request.file.path

        console.log("Validated data:", value);

        const saveTask = new Task(newTask);
        await saveTask.save()
            .then((savedTask) => {
                console.log(savedTask);
                response.status(201).json({ success:true, message: "Task Saved Successfully", id: savedTask._id });
            })
            .catch((error) => {
                console.log(error);
                response.status(500).json({ msg: "Unable to create new Task" })
            })
    } catch (error) {
        console.log(error);
        response.status(500).json({success:false, msg: "Unable to create new Task" });
    }
});


    router.get('/get-list', passport.authenticate('jwt', { session: false }), async (request, response) => {
        try {
          
            const userId = request.user._id;
            Task.find({ userId: userId })
                .then((savedTasks) => {
                    //console.log("Retrieved tasks:", savedTasks);
                    response.status(200).json({ savedTasks: savedTasks });
                })
                .catch((error) => {
                    console.log("Database error:", error); 
                    response.status(500).json({ msg: "Unable to get Data" });
                });
        } catch (error) {
            console.log("Error:", error);
            response.status(500).json({ success:false,msg: "Unable to get Task List" });
        }
    });
    
    router.get('/search/:id', passport.authenticate('jwt', { session: false }), async (request, response) => {
        try {
            const id = request.params.id;
            const userId = request.user._id; 
      
            const task = await Task.findOne({ _id:id, userId: userId });
    
            if (!task) {
                return response.status(404).json({message: "Task not found or unauthorized User" });
            }    

            Task.findById(id)
                .then((savedTask) => {
                    if (!savedTask) {
                        // No task found with the given ID
                        console.log("Task not found");
                        response.status(404).json({ msg: "Task not found" });
                    } else {
                        console.log("Found task:", savedTask);
                        response.status(200).json({success:true,savedTask: savedTask });
                    }
                })
                .catch((error) => {
                    console.log("Database error:", error);
                    response.status(500).json({ msg: "Unable to find Task Data" });
                });
        } catch (error) {
            console.log("Error:", error);
            response.status(500).json({ success:false,message: "Unable to get Task Data" });
        }
    });
    

router.put('/update/:id', upload,  passport.authenticate('jwt', { session: false }),async (request, response) => {
    try {


        // Extract task ID from route parameters
        const taskId = request.params.id;
        const userId = request.user._id; 
  
        const task = await Task.findOne({ _id: taskId, userId: userId });

        if (!task) {
            return response.status(404).json({ msg: "Task not found or unauthorized User" });
        }

    
            const { error, value } = validationSchema.validate(request.body);

       
            if (error) {
                return response.status(400).json({ error: error.details[0].message });
            }
    
        const id = request.params.id;
        const updatedTask = {
            title: request.body.title,
            description: request.body.description,
            completionStatus: request.body.completionStatus,

        };

        if (request.file != undefined)
            updatedTask.image = request.file.path;

        const existingTask = await Task.findById(id);
        const previousImagePath = existingTask.image;


        const updatedData = await Task.findByIdAndUpdate(id, updatedTask, { new: true }).select('-__v -userId');

        // Delete the previous image file if it exists and if a new image is uploaded
        if (request.file != undefined && previousImagePath) {
            const imagePathToDelete = path.join(__dirname, '..', previousImagePath);
            if (fs.existsSync(imagePathToDelete)) {
                fs.unlinkSync(imagePathToDelete);
            }
        }

        response.status(200).json({ success:true,message: "Data Updated", UpdatedData: updatedData });
    } catch (error) {
        console.log(error);
        response.status(500).json({ success:false,message:"Unable to update Data" });
    }
});

router.delete('/delete/:id', passport.authenticate('jwt', { session: false }), async (request, response) => {
    try {
        const taskId = request.params.id;
        const userId = request.user._id; //user ID is extracted correctly from the token

        const task = await Task.findOne({ _id: taskId, userId: userId }); // Check if task belongs to the authenticated user

        if (!task) {
            return response.status(404).json({ msg: "Task not found or unauthorized User" });
        }

        const delTask = await Task.findByIdAndDelete(taskId);

        if (delTask) {
            console.log(delTask);
            return response.status(200).json({ success:true,message: "Data deleted Successfully", delTask: delTask.id });
        } else {
            return response.status(404).json({ msg: "No task found with the provided ID" });
        }
    } catch (error) {
        console.log(error);
        return response.status(500).json({ success:false,message:"Unable to Delete Data" });
    }
});
module.exports = router;