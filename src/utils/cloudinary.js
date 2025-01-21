import {v2 as cloudinary} from "cloudinary";
import fs from "fs";


cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadOnCLoudinary= async (localfilepath)=>{
    try {
        if(!localfilepath) return null;
        //upload 
        const response =await cloudinary.uploader.upload(localfilepath,{
            resource_type:"auto"
        })
        // succesfull uploading check
        console.log("file uplaoding done",response.url);
        return response;
    } catch (error) {
        //removcing it from the locall server
        fs.unlinkSync(localfilepath)
        // uploading failed 
        console.log("erroe in cloduinar,js in uploading ::".error)
    }
}