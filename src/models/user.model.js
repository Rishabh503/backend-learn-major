import mongoose, { Schema } from "mongoose";
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema=new mongoose.Schema(
    {
    username:{
        type:String,
        required:true,
        unique:true,
        lowercase:true, 
        trim:true,
        index:true
    },
    email:{
        type:String,
        required:true,
        unique:true,
        lowercase:true, 
        trim:true,
    },
    fullName:{
        type:String,
        required:true,
        trim:true,
        index:true
    },
    avatar:{
        type:String,//cloudinary ka url
        required:true,
    },
    coverImage:{
        type:String, // cloudinry ka url
    },
    watchHistory:[
        {
            type:Schema.Types.ObjectId,
            ref:"Video"
        }
    ],
    password:{
        type:String,
        required:[true,'password is required']
    },
    refreshToken:{
        type:String
    }
},{timestamps:true})

//doing somethinf before saviing iske pass next ka acess hogaa 
//bcrypt kro 


userSchema.pre("save",async function (next){
    if(!this.isModified("password")) return next();
    this.password=await bcrypt.hash(this.password,10)
    next()
})
// so yaha kya h wo dekho to pre mtlb hume password encrypt krke save krna hai right 
// now we will perform save operation here so we have next and bcrypt hash krega 
// ye ismodified moongose se aya hai jo ye btata hai ki koi filed modified ha ya nhi 
// to modify ho to hi age bdhna hai wrna age jao 

// //<-- -->


// creating a method to check password 

// ye to easy hai just apna bcrypt kam kra hai smjh aajeyaga 
userSchema.methods.isPasswordCorrect=async function(password){
    return await bcrypt.compare(password,this.password)
}
//YE JWT KA TOKEN RETURN KRTA HAI

// yaha pe jo jwt.sign ka pehla wo hai jisme hum data bhejte h for token
//seconf is code 
//third are object of optins basically   
userSchema.methods.genrateAccessToken=function(){
    return jwt.sign({
        _id:this._id,
        email:this.email,
        username:this.username,
        fullName:this.fullName
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
        expiresIn:process.env.ACCESS_TOKEN_EXPIRY
    }
)
}
userSchema.methods.genrateRefreshToken=function(){
    return jwt.sign({
        _id:this._id,
    },
    process.env.REFRESH_T0KEN_SECRET,
    {
        expiresIn:process.env.REFRESH_TOKEN_EXPIRY
    }
)
}



export const User=mongoose.model("User",userSchema)