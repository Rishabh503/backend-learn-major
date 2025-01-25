import {asyncHandler} from "../utils/asyncHandler.js"
import {upload} from "../middlewares/multer.middleware.js"
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {uploadOnCLoudinary} from "../utils/cloudinary.js"
import {ApiResponse} from "../utils/ApiResponse.js"
import jwt from "jsonwebtoken"

//ye final jo func calll hora h wo hai kaha se call ara wo dkehte 
// export const registerUser=asyncHandler(async (req,res)=>{
//     res.status(200).json({
//         message:"ok"
//     })
// })
        // ye func khud hi acess and refresh token dega jab isko userid dege
const generateAcessAndRefreshTokens=async (userId)=>{
    try {
       const user= await User.findById(userId)
            const accessToken=user.genrateAccessToken();
            const refreshToken=user.genrateRefreshToken();

            //ab jo access n refresh token hota hai wo user ke pass jata hai and refresh jo hai wo db me bhi jata h
            // to db  me bhejte hai 
            /// if u r thinking ye aya kaha se 💀 so ye aya hai user se jo hum usermodels se leke aye hai aur hum usme ye refresh token add kre hai 
            user.refreshToken=refreshToken
            //ab save krwate hai but we just have to save not validate so we will use mongose ka method
            await user.save({validateBeforeSave:false})

            // dono ko bhejdo bahar is fnc ke 
        return {accessToken,refreshToken}

    } catch (error) {
        console.log(error)
        throw new ApiError(500,"something went wrong while creatnt tokenss in user.controller ")
    }
}

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
        console.log(req.files)
    const avatarLocalPath = await req.files?.avatar[0]?.path;
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
// ajj likhege login and all ka code 
const loginUser=asyncHandler(async (req,res)=>{
    // req-> data
    //username or email me kisi ek se login
    //find the user
    //user found or not
    //password check
    //acess and refresh token
    // send cookie

    // req-> data
    const {email , username,password}=req.body
    
    if(!username && !email){
        throw new ApiError(400,"username or email is required")
    }
     //find the user
     const user=await User.findOne({
        $or:[{username},{email}]
     })
        // when user isnot found 
     if(!user){
        throw new ApiError(404,"User doesnt exist")
     }

    //  checking password
            // heere we are usng our user to check bcoz it will have althose features then the User of mongosedb

    const isPasswordValid=await user.isPasswordCorrect(password)

    if(!isPasswordValid){
        throw new ApiError(401,"invalid password credentials")
    }

    const {accessToken,refreshToken}=await generateAcessAndRefreshTokens(user._id)

    // ab app isko cookies me bhejo
    const  loggedInUser=await User.findById(user._id).select("-password -refreshToken")

    //sb hogya chliye wapis kre ise  along with cookies
            // ab cookie ke kuch option hota h unhe banalete ha 
            const options={
                httpOnly:true
                ,secure:true
            }

    return res.status(200)
    .cookie("accessToken",accessToken,options)
    .cookie("refreshToken",refreshToken,options)
    .json(
        new ApiResponse(
            200,{
                user:loggedInUser,
                accessToken,
                refreshToken
            },
            "User Logged In succesfully"
        )
    )

})

const loggoutUser=asyncHandler(async (req,res)=>{
        await User.findByIdAndUpdate(
            req.user._id,{
                $set:{
                    refreshToken:undefined
                }
            },
            {
                new:true
            }
        )

        const options={
            httpOnly:true,
            secure:true
        }

        return res.status(200)
        .clearCookie("accessToken",options)
        .clearCookie("refreshToken",options)
        .json(new ApiResponse(200,{},"User gaya ie logout"))
})

const refreshAccessToken=asyncHandler(async (req,res)=>{
    //purana refresh token liya
    const incomingRefreshToken= req.cookies.refreshToken || req.body.refreshToken

    // aaya to thik nhi to error 
    if(!incomingRefreshToken){
        throw new ApiError(401,"unauthorized request in refresh acess token")
    }


   try {
    // decoding our token kyuki ye jwt ki bhasha hai
     const decodedToken=jwt.verify(
         incomingRefreshToken,
         process.env.REFRESH_TOKEN_SECRET
     )
     // getting that user because is token me id hogii
 
     const user =await User.findById(decodedToken?._id)
 //user aya to thik wrna thik
     if(!user){
         throw new ApiError(401,"invlaud refres token no user there or ")
     }
 // check if old and nnew tokenss are same
     if(incomingRefreshToken !==user?.refreshToken){
         throw new ApiError(401,"refresh token is expired or used")
     }
 //ye options to hum apni cookie ke liye banaye h

     const options={
         httpOnly:true,
         secure:true
     }
//ab same hai to kya krna hai ek new access token and ek new refresh token bana dena hai
     const {accessToken,newrefreshToken}=await generateAcessAndRefreshTokens(user._id)
 // in tokens ko add krdena hai
     return res
     .status(200)
     .cookie("acessToken",accessToken,options)
     .cookie("refreshToken",newrefreshToken,options)
     .json(
         new ApiResponse(
             200,
             {accessToken,refreshToken:newrefreshToken},
             "Acesss token refreshed"
         )
     )
   } 
   catch (error) {
        throw new ApiError(401,error?.message || "invalid refresh token")
   }

})

//changing and updating 
const changeCurrentPassword= asyncHandler(async (req,res)=>{

    const {oldPassword,newPassword}=req.body
    //is stage pe bnda login hai that means auth middleware chala hai so we could easily have that req.user me uski id kyuki humne auth middlewafe me wo add kkiua tha 
    const idOfUser=await req.user?._id

    const user =await User.findById(idOfUser)
    const isPasswordCorrect=await user.isPasswordCorrect(oldPassword)

    if(!isPasswordCorrect){
        throw new ApiError(400,"ivalid old password   ")
    }

    user.password=newPassword

    await user.save({validateBeforeSave:false})

    return res.status(200).json(new ApiResponse(200,{},"password changed succesfully"))


})

const getCurrentUser=asyncHandler(async (req,res)=>{
    return res.status(200).json(new ApiError(200,req.user,"user fetched succesfully"));
})

const updateAccountDetails=asyncHandler(async(req,res)=>{
    const {fullName,email}=req.body

    const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                fullName:fullName,
                email:email
            }
        },
        {new:true}
    ).select("-password")

    return res.status(200)
    .json(new ApiResponse(200,user,"Account details updated Succesfully"))
})

const updateUserAvatar=asyncHandler(async(req,res)=>{
    const avatarLocalPath=req.file?.path
    
    if(!avatarLocalPath){
        throw new ApiError(401,"avtar file is missing")
    }

    const avatar=await uploadOnCLoudinary(avatarLocalPath)

    
    if(!avatar.url){
        throw new ApiError(401,"error whole avtar uploading ")
    }

   const user=await User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                avatar:avatar.url
            }
        },
        {new:true}
    ).select("-password")

    return res.status(200)
    .json(new ApiResponse(200,
        user,
        "user avatar u[dated succesfully"))

})

const updateLocalImage=asyncHandler(async(req,res)=>{
    const localImagePath=req.file?.path

    if(!localImagePath){
        throw new ApiError(401,"local image file is missng")
    }
    const localImage=await uploadOnCLoudinary(localImagePath)

    if(!localImage.url){
        throw new ApiError(401,"local image file is missng")
    }
    const user=User.findByIdAndUpdate(
        req.user?._id,
        {
            $set:{
                coverImage:localImage.url
            }
        },
        {new:true}
    ).select("-password")

    return res.status(200)
    .json(
        new ApiResponse(200,user,"cover image succsfully updated")
    )
})


export {
    registerUser,
    loginUser,
    loggoutUser,
    refreshAccessToken,
    getCurrentUser,
    changeCurrentPassword,
    updateAccountDetails,
    updateUserAvatar,
    updateLocalImage
}

 