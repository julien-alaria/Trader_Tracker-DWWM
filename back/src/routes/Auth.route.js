import express from "express"
import AuthController from "../controllers/AuthController.js"
import upload from "../services/multerConfig.js"

const authRouter = express.Router()

authRouter.post("/login", AuthController.login)

authRouter.post("/register", upload.fields([ 
    { name: 'picture', maxCount: 1 }, 
    { name: 'document', maxCount: 1 }
]), AuthController.register)

export default authRouter
