import express from "express"
import stockRouter from "./Stock.route.js"
import userRouter from "./User.route.js"
import authRouter from "./Auth.route.js"

const router = express.Router();

router.user("/auth", authRouter)
router.use("/users", userRouter)
router.use("/stock", stockRouter)

export default router;