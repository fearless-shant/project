//require('dotenv').config({path:'./env'})
import dotenv from "dotenv" 
import mongoose from "mongoose"
import connectDB from "./db/index.js"
import { app } from "./app.js"

/**
 * To re-enable proxy support (when at college/network with HTTP proxy):
 * 1. Uncomment the proxyOptions block below
 * 2. Uncomment the PROXY_* lines in .env
 * 3. Run: npm install socks
 * const proxyOptions = {}
 * if (process.env.PROXY_HOST) {
 *     const bridge = await startSocksBridgeForHttpProxy()
 *     proxyOptions.proxyHost = "127.0.0.1"
 *     proxyOptions.proxyPort = bridge.port
 * }
 */

dotenv.config({
    path: './.env'
})


connectDB()
.then(()=>{
    app.listen(process.env.PORT|| 8000,()=>{
        console.log(`Server is running st port: ${process.env.PORT}`);
    })
})
.catch((err)=>{
    console.log("MONGO db connection failed !!! ",err);
})