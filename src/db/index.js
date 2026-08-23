import mongoose from "mongoose"

/**
 * To re-enable proxy support:
 * 1. Uncomment the proxyOptions block below
 * 2. Ensure .env has PROXY_HOST, PROXY_PORT, PROXY_USERNAME, PROXY_PASSWORD set
 * 3. Install the 'socks' npm package: npm install socks
 * const proxyOptions = {}
 * if (process.env.PROXY_HOST) {
 *     const bridge = await startSocksBridgeForHttpProxy()
 *     proxyOptions.proxyHost = "127.0.0.1"
 *     proxyOptions.proxyPort = bridge.port
 * }
 */

const connectDB = async ()=> {
    try{
        const connectionInstance = await mongoose.connect(
            process.env.MONGODB_URI)
        console.log(`\n MongoDB connected !! DB Host: ${
            connectionInstance.connection.host}`);
    }catch(error){
        console.log("MONGODB connection error ",error);
        process.exit(1)
    }
}
export default connectDB