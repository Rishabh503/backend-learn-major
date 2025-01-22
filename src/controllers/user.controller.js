import {asyncHandler} from "../utils/asyncHandler.js"
import {upload} from "../middlewares/multer.middleware.js"

//ye final jo func calll hora h wo hai kaha se call ara wo dkehte 
// export const registerUser=asyncHandler(async (req,res)=>{
//     res.status(200).json({
//         message:"ok"
//     })
// })

export const registerUser=asyncHandler(async (req,res)=>{
    //get user data
        // req.body me sb aajata hai from json and form (url excluded)
        const {fullName ,email,username,password}=req.body
        //dry run to check
        console.log(fullName)
    // validation -> not empty and all
    //check if user already exists --
    //file exists or not ie avatar and images (see the model for this)
    // upload them to  cloudinary , avatar gya ya ni
    // creaate a user obj for mongo db
    // remove password and refresh token
    //return res 
  
})

 