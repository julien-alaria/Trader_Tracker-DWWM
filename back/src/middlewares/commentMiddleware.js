import UserModel from "../models/UserModel.js"
import AssetModel from "../models/AssetModel.js"

export default function CommentMiddleware() {

    return async function(req, res, next) {

        try {

            const userId = req.user.id
            const { asset_id } = req.body

            const analyst = await UserModel.getUsersById(userId)

            if (!analyst) {
                return res.status(404).json({ message: "User not found" })
            }

            if (analyst.role !== "analyst") {
                return res.status(403).json({ message: "Only analysts can create recommendations" })
            }

            const asset = await AssetModel.getAssetById(asset_id)

            if (!asset) {
                return res.status(404).json({ message: "Asset not found" })
            }

            if (analyst.analyst_type_id !== asset.asset_type_id) {
                return res.status(403).json({ message: "You cannot comment this asset type" })
            }

            next()

        } catch (error) {
            return res.status(500).json({ error: error.message })
        }
    }
}