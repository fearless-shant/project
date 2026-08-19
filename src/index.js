//require('dotenv').config({path:'./env'})
import dotenv from "dotenv" 
import mongoose from "mongoose"
import connectDB from "./db/index.js"
connectDB()

/* ;(async()=>{
     try{
         await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
         app.on("error",(error)=>{
             console.log("ERRR: ",error);
             throw error
         })
         // for catching error incase the app aint able to connect to sever
         app.listen(process.env.PORT,()=>{
             console.log(`App is listening port ${process.env.PORT}`);
         })
     }catch(error){
         console.error("ERROR: ",error)
         throw error
     }
 })()*/