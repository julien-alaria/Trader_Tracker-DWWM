import AssetModel from "../models/AssetModel.js"

async function getAssetDetails(req, res) {
    try {
        const { ticker } = req.params

        const asset = await AssetModel.getAssetByTicker(ticker)

        if (!asset) {
            return res.status(404).json({ message: "Asset not found in database" });
        }

        return res.status(200).json(asset)
    } catch (error) {
        console.error("AssetController Error:", error);
        return res.status(500).json({ message: "Server error during retrieval" })
    }
}

export default getAssetDetails