import express from "express"
import StockController from "../controllers/StockController.js"

const stockRouter = express.Router()

stockRouter.get("/", StockController.getAllStocks)

export default stockRouter