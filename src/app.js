import express from "express"
import cors from "cors"
import cookieParser from "cookie-parser"// to access and read from the users browser
const app = express()


app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({limit:"16kb"}))
app.use(express.urlencoded({extended:true,limit:"16kb"}))
app.use(express.static("public"))
// middle ware use:- insta account access but middle ware checks before accessing whether you are logged in or not ??whether you are logged in or not  
export {app}