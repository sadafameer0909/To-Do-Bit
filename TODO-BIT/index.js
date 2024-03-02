const express=require('express')
const fs=require('fs')
const path=require('path')
const dotenv=require('dotenv')
const mongoose=require('mongoose')
dotenv.config();

//import List Router 
const userRouter = require('./routes/UserRoute');
const taskRouter = require('./routes/TaskRoute')

const server=express()
server.use(express.json())
server.use(express.urlencoded({extended:true}));

server.use("/api", taskRouter);
server.use("/web",userRouter);


server.get("/docs",(request,response)=>
{
    response.setHeader('Content-Type','text/html');
    response.send(fs.readFileSync(path.join(__dirname,'apiDocs.html')))
})

//Connect MongoDB to Mongoose
const connectToDB = async()=>{
        await mongoose.connect('mongodb://localhost:27017/to-do-db');
        console.log("Connected to MongoDB ..... ")    
}

//Listen to Server
server.listen(process.env.PORT,()=>
{
    connectToDB()
    .then(()=>{
        console.log(`Server Running http://localhost:${process.env.PORT}`)
    }).catch((err)=>{
        console.log(err)
        process.exit(1)
    })
});
