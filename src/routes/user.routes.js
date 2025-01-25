import {Router} from "express";
import {registerUser} from "../controllers/user.controller.js"
import {upload} from "../middlewares/multer.middleware.js"
import {ApiError} from "../utils/ApiError.js"

//router bnaya  and uska route banaya
const router=Router()
  
// yaha bhi hum do kam krege  -
    // firts is to save this data in our local stroeage as discussed using  middleware multer 
        //so for this we will get the upload methids here 
    // second is to normal perform our register user func 
    // neeche ka code pehle ka hai 
// router.route("/register").post(registerUser) 

router.route("/register").post(
    upload.fields([
        {
            name:"avatar",
            maxCount:1
        },{
            name:"coverImage",
            maxCount:1
        }
    ]),
    registerUser
)

export default router