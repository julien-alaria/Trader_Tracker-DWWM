import express from "express"
import UserController from "../controllers/UserController.js"
import AuthMiddleware from "../middlewares/authMiddleware.js"

const userRouter = express.Router()

// public
userRouter.post("/", UserController.createUser)

userRouter.get("/me", AuthMiddleware(), UserController.getMe)

userRouter.get("/me/watchlist", AuthMiddleware(), UserController.getWatchlist)

userRouter.post("/me/follows", AuthMiddleware(), UserController.followAsset)

userRouter.delete("/me/follows", AuthMiddleware(), UserController.unfollowAsset)

// admin
userRouter.get("/", AuthMiddleware(["admin"]), UserController.getUser)

userRouter.get("/:id", AuthMiddleware(["admin"]), UserController.getUserById)

userRouter.put("/:id", AuthMiddleware(["admin"]), UserController.updateUser)

userRouter.delete("/:id", AuthMiddleware(["admin"]), UserController.deleteUser)

export default userRouter