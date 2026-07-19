import UserModel from "../models/UserModel.js"
import AppError from "../utils/AppError.js"
import jwt from "jsonwebtoken"

export default function AuthMiddleware(roles = []) {
   
    return async function(req, res, next) {
        const authHeader = req.header("Authorization")
     
        const [prefix, token] = authHeader?.split(" ") || [null, undefined]

        if (prefix !== "Bearer") {
            throw new AppError("No Bearer token", 401)
        }

        if (!token) {
            throw new AppError("You must be authenticated to access this resource", 401)
        }

        try {
            let decoded
            try {
                decoded = jwt.verify(token, process.env.JWT_SECRET)
            } catch {
                throw new AppError("Invalid or expired token", 401)
            }
            
            if (!decoded?.id) {
                throw new AppError("Invalid Payload", 401)
            }

            const user = await UserModel.getUsersById(decoded.id)

            if (!user) {
                throw new AppError("User not found", 401)
            }

            if (roles.length && !roles.includes(user.role)) {
                throw new AppError("Permission denied, you are not authorized to access this resource", 403)
            }

            req.user = user

            return next()

        } catch (error) {
            next(error)
        }
    } 
}