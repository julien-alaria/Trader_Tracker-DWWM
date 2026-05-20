import express from "express"
import UserController from "../controllers/UserController.js"
import AuthMiddleware from "../middlewares/authMiddleware.js"

const userRouter = express.Router()

userRouter.get("/", UserController.getUser)
userRouter.post("/", AuthMiddleware(), UserController.createUser)