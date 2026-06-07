import express from "express"
import UserController from "../controllers/UserController.js"
import AuthMiddleware from "../middlewares/authMiddleware.js"
import AssetMiddleware from "../middlewares/assetMiddleware.js"

const userRouter = express.Router()

// public
userRouter.post("/", UserController.createUser)

// self users
userRouter.get("/me", AuthMiddleware(), UserController.getMe)

userRouter.get("/me/watchlist", AuthMiddleware(), UserController.getWatchlist)

userRouter.post("/me/follows", AuthMiddleware(), AssetMiddleware(), UserController.followAsset)

userRouter.put("/me", AuthMiddleware(), UserController.updateMe)

userRouter.delete("/me/follows/:ticker", AuthMiddleware(), AssetMiddleware(), UserController.unfollowAsset)

// admin
userRouter.get("/", AuthMiddleware(["admin"]), UserController.getUser)

userRouter.get("/:id", AuthMiddleware(["admin"]), UserController.getUserById)

userRouter.put("/:id", AuthMiddleware(["admin"]), UserController.updateUser)

userRouter.delete("/:id", AuthMiddleware(["admin"]), UserController.deleteUser)

export default userRouter