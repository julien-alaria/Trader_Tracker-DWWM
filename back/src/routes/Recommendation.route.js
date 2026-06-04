import express from "express"
import RecommendationController from "../controllers/RecommendationController.js"
import AuthMiddleware from "../middlewares/authMiddleware.js"
import AssetMiddleware from "../middlewares/assetMiddleware.js"
import SpecializationMiddleware from "../middlewares/specializationMiddleware.js"

const RecommendationRouter = express.Router()

RecommendationRouter.get("/", RecommendationController.getRecommendation)

RecommendationRouter.post("/", AuthMiddleware(["analyst", "admin"]), AssetMiddleware(), SpecializationMiddleware(), RecommendationController.createRecommendation)

RecommendationRouter.put("/:id", AuthMiddleware(["analyst", "admin"]), RecommendationController.updateRecommendation)

RecommendationRouter.delete("/:id", AuthMiddleware(["analyst", "admin"]), RecommendationController.deleteRecommendation)

export default RecommendationRouter

