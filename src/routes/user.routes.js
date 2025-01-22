import {Router} from "express";
import {registerUser} from "../controllers/user.controller.js"

//router bnaya  and uska route banaya
const router=Router()
  
// yaha bhi hum do kam krege 
router.route("/register").post(registerUser)

export default router