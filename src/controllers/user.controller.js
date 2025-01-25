import {asyncHandler} from "../utils/asyncHandler.js"
import {upload} from "../middlewares/multer.middleware.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCLoudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"

//ye final jo func calll hora h wo hai kaha se call ara wo dkehte 
// export const registerUser=asyncHandler(async (req,res)=>{
//     res.status(200).json({
//         message:"ok"
//     })
// })

const registerUser=asyncHandler(async (req,res)=>{
    //get user data
        // req.body me sb aajata hai from json and form (url excluded)
        const {fullName ,email,username,password}=req.body
        //dry run to check and console log this req.body
        // console.log(fullName)  
    // validation -> not empty and all
    if(fullName==="" || email==="" || username==="" || password===""){
        throw new ApiError(400,"all fields are required ")
    }
    //check if user already exists --

    const existedUser =await User.findOne({
        $or:[{username},{email}]
    })

    if(existedUser) {
        throw new ApiError(409,"User with email or username already existed")
    }
    //file exists or not ie avatar and images (see the model for this)
        // ye multer se aaya ha
    const avatarLocalPath = req.files?.avatar[0]?.path;
    // const coverImageLocalPath = req.files?.coverImage[0]?.path; 

    // ye req.files ko console.log kro 
    
    //ok so we have here checeked for avatar
    // so we will check here 
    let coverImageLocalPath;
    if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length>0){
        coverImageLocalPath=req.files.coverImage[0].path
    }

    if(!avatarLocalPath) {
        throw new ApiError(400,"Avatar file is not uploaded")
    }

    // upload them to  cloudinary , avatar gya ya ni
    const avatar = await uploadOnCLoudinary(avatarLocalPath)
    const coverImage=await uploadOnCLoudinary(coverImageLocalPath)

    if(!avatar){
        throw new ApiError(400,"avatar doesnt exists")
    }
    // creaate a user obj for mongo db
   const user= await User.create({
        fullName,
        avatar:avatar.url,
        coverImage:coverImage?.url || "",
        email,
        password,
        username:username.toLowerCase()
    })
    // remove password and refresh token
    const createdUser= await User.findById(user._id).select(
        "-password -refreshToken"
    )
    
    if(!createdUser){
        throw new ApiError(500,"something went wrong while registerinf the user ");
    }
    
    //return res 

    return res.status(201).json(
         new ApiResponse(200 ,createdUser,"user aagya ")
    )

  
})

export {
    registerUser,
}

 