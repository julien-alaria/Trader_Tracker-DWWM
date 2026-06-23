import express from "express"
import StockController from "../controllers/StockController.js"
import getAssetDetails from "../controllers/AssetController.js"
import AuthMiddleware from "../middlewares/authMiddleware.js"

const stockRouter = express.Router()

stockRouter.get("/stocks", StockController.getAllStocks)
stockRouter.get("/forex", StockController.getForex)
stockRouter.get("/commodities", StockController.getCommodities)

// Light data for home.js
stockRouter.get("/home/stocks", StockController.getHomeStocks)
stockRouter.get("/home/forex", StockController.getHomeForex)
stockRouter.get("/home/commodities", StockController.getHomeCommodities)

// Super light data for list.js
stockRouter.get("/brief/all", StockController.getCombinedBriefAssets)

stockRouter.get("/details/:ticker", getAssetDetails)

export default stockRouter