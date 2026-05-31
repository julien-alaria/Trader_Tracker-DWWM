import UserModel from "../models/UserModel.js"
import AssetModel from "../models/AssetModel.js"

export default function recommendationMiddleware() {

    return async function(req, res, next) {

        try {

            const userId = req.user.id
            const { asset_id } = req.body

            const analyst = await UserModel.getUsersById(userId)

            if (!analyst) {
                return res.status(404).json({ message: "User not found" })
            }

            if (analyst.role === "admin") {
                return next()
            }

            if (analyst.role !== "analyst") {
                return res.status(403).json({ message: "Only analysts can create recommendations" })
            }

            const asset = await AssetModel.getAssetById(asset_id)

            if (!asset) {
                return res.status(404).json({ message: "Asset not found" })
            }

            console.log("analyst type:", analyst.analyst_type_id, typeof analyst.analyst_type_id)
            console.log("asset type:", asset.asset_type_id, typeof asset.asset_type_id)

            if (analyst.analyst_type_id !== asset.asset_type_id) {
                return res.status(403).json({ message: "You cannot recommend this asset type" })
            }

            next()

        } catch (error) {
            return res.status(500).json({ error: error.message })
        }
    }
}