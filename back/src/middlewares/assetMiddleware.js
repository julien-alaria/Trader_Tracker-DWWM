import AssetModel from "../models/AssetModel.js"
import AppError from "../utils/AppError.js"

export default function AssetMiddleware() {
    
    return async function (req, res, next) {
        try {
            const ticker = req.body?.ticker || req.params?.ticker

            if (!ticker) {
                throw new AppError("ticker is required", 400)
            }

            const asset = await AssetModel.getAssetByTicker(ticker)

            if (!asset) {
                throw new AppError("Asset not found", 404)
            }

            req.asset = asset
        
            next()

        } catch (error) {
            next(error)
        }
    }
}