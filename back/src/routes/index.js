import express from "express"
import StockRouter from "./Stock.route.js"
import userRouter from "./User.route.js"
import authRouter from "./Auth.route.js"

const router = express.Router()

router.use("/auth", authRouter)
router.use("/users", userRouter)
router.use("/stock", StockRouter)

export default router;