import AssetModel from "../models/AssetModel.js"

async function getAssetDetails(req, res, next) {
    try {
        const { ticker } = req.params

        const asset = await AssetModel.getAssetByTicker(ticker)

        if (!asset) {
            return res.status(404).json({ message: "Asset not found in database" });
        }

        return res.status(200).json(asset)
    } catch (error) {
        next(error)
    }
}

export default getAssetDetails