import express from "express"
import StockController from "../controllers/StockController.js"
import getAssetDetails from "../controllers/AssetController.js"
import AuthMiddleware from "../middlewares/authMiddleware.js"

const stockRouter = express.Router()

stockRouter.get("/stocks", StockController.getAllStocks)
stockRouter.get("/forex", StockController.getForex)
stockRouter.get("/commodities", StockController.getCommodities)

stockRouter.get("/details/:ticker", getAssetDetails)

export default stockRouter