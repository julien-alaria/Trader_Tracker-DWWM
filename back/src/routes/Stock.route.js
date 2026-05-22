import express from "express"
import StockController from "../controllers/StockController.js"

const stockRouter = express.Router()

stockRouter.get("/", StockController.getStock)

export default stockRouter