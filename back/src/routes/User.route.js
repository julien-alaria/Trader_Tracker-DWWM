import express from "express"
import UserController from "../controllers/UserController.js"
import AuthMiddleware from "../middlewares/authMiddleware.js"

const userRouter = express.Router()

userRouter.get("/", AuthMiddleware(), UserController.getUser)
userRouter.post("/", UserController.createUser)
userRouter.get("/:id", AuthMiddleware(), UserController.getUserById)
userRouter.put("/:id", AuthMiddleware(), UserController.updateUser)
userRouter.delete("/:id", AuthMiddleware(["admin"]), UserController.deleteUser)

export default userRouter