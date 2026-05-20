import express from "express"
import userRouter from "./User.route.js"
import authRouter from "./Auth.route.js"

const router = express.Router()

router.use("/auth", authRouter)
router.use("/users", userRouter)

export default router;