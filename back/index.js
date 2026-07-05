import express from "express"
import cors from "cors"
import rateLimit from "express-rate-limit"
import dotenv from 'dotenv'
import getConnection from "./src/db/connection.js"
import routes from "./src/routes/index.js"
import securityHeaders from "./src/middlewares/securityHeadersMiddleware.js"
import errorHandler from "./src/middlewares/errorHandler.js"

dotenv.config()

const app = express()
const PORT = process.env.APP_PORT || 3000

// SECURITY: protective HTTP headers (homemade, see securityHeadersMiddleware.js)
app.use(securityHeaders)

app.use(cors({
    origin: process.env.FRONTEND_URL
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// SECURITY: limit login/register attempts to mitigate brute-force
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // max 20 attempts per IP per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many attempts, please try again later." }
})
app.use("/auth", authLimiter)

app.use("/", routes)
app.use('/uploads', express.static('uploads'))

app.get('/', (req, res) => {
    res.send('Welcome to DWWM Project!')
})

app.use(errorHandler)

async function startServer() {
    try {
        await getConnection()
        console.log("Database connection ON")

        app.listen(PORT, () => {
        console.log(`Listening at the port ${PORT}`)
        })
    } catch (error) {
        console.error("Database connection error:", error.message)
    }
}

startServer()


