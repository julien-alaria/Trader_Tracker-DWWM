import AssetModel from "../models/AssetModel.js"

export default function AssetMiddleware() {
    
    return async function (req, res, next) {
        try {
            //const user = req.user
            const ticker = req.body?.ticker || req.params?.ticker

            if (!ticker) {
                return res.status(400).json({ error: "ticker is required" })
            }

            const asset = await AssetModel.getAssetByTicker(ticker)

            if (!asset) {
                return res.status(404).json({ error: "Asset not found" })
            }

            req.asset = asset
            req.asset_id = asset.id
            //delete req.body.ticker

            return next()

        } catch (error) {
            console.error("ASSET MIDDLEWARE ERROR:", error)
            return res.status(500).json({ error: error.message })
        }
    }
}