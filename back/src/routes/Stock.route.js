import express from "express"
import StockController from "../controllers/StockController.js"

const stockRouter = express.Router()

stockRouter.get("/stocks", StockController.getAllStocks)

stockRouter.get("/forex", StockController.getForex)

stockRouter.get("/commodities", StockController.getCommodities)

export default stockRouter