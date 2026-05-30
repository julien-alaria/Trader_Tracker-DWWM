import express from "express"
import CommentController from "../controllers/CommentController.js"
import AuthMiddleware from "../middlewares/authMiddleware.js"
import commentMiddleware from "../middlewares/commentMiddleware.js"

const commentRouter = express.Router()

commentRouter.get("/", CommentController.getComment)

commentRouter.post("/", AuthMiddleware(["analyst"]), commentMiddleware(), CommentController.createComment)

commentRouter.put("/:id", AuthMiddleware(["analyst"]), CommentController.updateComment)

commentRouter.delete("/:id", AuthMiddleware(["analyst"]), CommentController.deleteComment)

export default commentRouter

