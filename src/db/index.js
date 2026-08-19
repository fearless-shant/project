import mongoose from "mongoose"
import startSocksBridgeForHttpProxy from "../utils/proxyBridge.js"

const connectDB = async ()=> {
    try{
        const proxyOptions = {}
        if (process.env.PROXY_HOST) {
            const bridge = await startSocksBridgeForHttpProxy()
            proxyOptions.proxyHost = "127.0.0.1"
            proxyOptions.proxyPort = bridge.port
        }
        const connectionInstance = await mongoose.connect(
            process.env.MONGODB_URI,
            proxyOptions)
        console.log(`\n MongoDB connected !! DB Host: ${
            connectionInstance.connection.host}`);
    }catch(error){
        console.log("MONGODB connection error ",error);
        process.exit(1)
    }
}
export default connectDB