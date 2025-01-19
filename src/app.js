import express from "express"
 import cors from "cors"
 import cookieParser from "cookie-parser"

const app= express()

app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

// configs for handling coming data 
//form bhara tb ka data
app.use(express.json({limit:"16kb"}))
//url ka data
app.use(express.urlencoded({extended:true}))
//pubic assests to store 
app.use(express.static("public"))
// to manipulate cookies 
app.use(cookieParser())


export{app}