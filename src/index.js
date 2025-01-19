// require('dotenv').config({path:'./env'})
import dotenv from "dotenv";
// import mongoose from "mongoose";
// import express from "express";
// import { DB_NAME } from "./constants";
import connectDB from "./db/index.js";
import { app } from "./app.js";

dotenv.config({
    path:'./env'
})

connectDB()
.then(()=>{
    app.listen(process.env.PORT || 8000,()=>{
        console.log(`server is tunning at port : ${process.env.PORT} `)
    })
})
.catch((error)=>{
    console.log("mongo db connexxtion failed in index.js of src",error)
})


//try catch and asycn await 
// function connectDB(){

// }

// connectDB()
//efis
// ()()
// common approach

/*
const app=express()
;(async ()=>{
    try {
        mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)

        app.on("error",(error)=>{
            console.log("error:",error);
            throw error
        })

        app.listen(process.env.PORT,()=>{
            console.log(`app is listenong on ${process.env.PORT}`);
        })
    } catch (error) {
        console.log("error is in db index.js".error)
        throw error
    }
})()
    */
