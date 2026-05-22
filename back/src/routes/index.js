import express from "express"
import userRouter from "./User.route.js"
import authRouter from "./Auth.route.js"
import stockRouter from "./Stock.route.js"

const router = express.Router()

router.use("/auth", authRouter)
router.use("/users", userRouter)
router.use("/stock", stockRouter)

export default router