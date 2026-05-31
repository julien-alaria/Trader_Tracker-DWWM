import AssetModel from "../models/AssetModel.js"

export default function recommendationMiddleware() {
    return async function(req, res, next) {
        try {
            const { ticker } = req.body
            const analyst = req.user

            if (!ticker) {
                return res.status(400).json({ message: "ticker is required" })
            }

            if (!analyst) {
                return res.status(404).json({ message: "User not found" })
            }

            if (analyst.role !== "analyst" && analyst.role !== "admin") {
                return res.status(403).json({ message: "Unauthorized" })
            }

            const asset = await AssetModel.getAssetByTicker(ticker)

            if (!asset) {
                return res.status(404).json({ message: "Asset not found" })
            }

            if (
                analyst.role !== "admin" &&
                analyst.analyst_type_id !== asset.asset_type_id
            ) {
                return res.status(403).json({ message: "Forbidden asset type" })
            }

            req.asset = asset

            next()
        } catch (error) {
            return res.status(500).json({ error: error.message })
        }
    }
}