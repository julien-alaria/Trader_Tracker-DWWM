import RecommendationModel from "../models/RecommendationModel.js"
import AssetModel from "../models/AssetModel.js"
import { sanitizeRecommendation, sanitizeRecommendationUpdate } from "../utils/sanitizer.js"

// GET
async function getRecommendationPagin(req, res) {
    try {
        const { ticker } = req.query

        const limit = Math.max(1, Number.parseInt(req.query.limit ?? 2, 10))
        const offset = Math.max(0, Number.parseInt(req.query.offset ?? 0, 10))

        // FILTER BY ASSET (ticker)
        if (ticker) {
            const asset = await AssetModel.getAssetByTicker(ticker)
            if (!asset) return res.status(404).json({ message: "Asset not found" });

            const results = await RecommendationModel.getRecommendationsByAssetId(asset.id, limit, offset)

            const nextPage = await RecommendationModel.getRecommendationsByAssetIdPaginated(asset.id, limit, offset + limit);
            const hasNext = nextPage.length > 0;

            return res.status(200).json({ results, hasNext })
        }

        const results = await RecommendationModel.getAllRecommendationsPaginated(limit, offset)

        const nextPage = await RecommendationModel.getAllRecommendationsPaginated(limit, offset + Number(limit))

        const hasNext = nextPage.length > 0

        return res.status(200).json({ results, hasNext })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

async function getMyRecommendation(req, res) {
    try {
        const userId = req.user.id
        const limit = Math.max(1, Number.parseInt(req.query.limit ?? 2, 10))
        const offset = Math.max(0, Number.parseInt(req.query.offset ?? 0, 10))

        const results = await RecommendationModel.getMyRecommendationsPaginated(userId, limit, offset)
        
        // On vérifie la page suivante pour le bouton "Next"
        const nextPage = await RecommendationModel.getMyRecommendationsPaginated(userId, 1, offset + limit)
        const hasNext = nextPage.length > 0

        return res.status(200).json({ results, hasNext })
    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

// POST
async function createRecommendation(req, res) {
    try {
        if (!req.asset) {
            return res.status(400).json({ message: "Asset not resolved" })
        }

        if (req.user.role === "analyst" && Number(req.user.analyst_verified) !== 1) {
            return res.status(403).json({ message: "Your analyst account is pending validation. You cannot publish any recommendations." })
        }

        if (req.user.role === "analyst" && req.user.analyst_type_id !== req.asset.asset_type_id) {
            return res.status(403).json({ message: "You are not authorized to post on this type of asset." })
        }

        const sanitizedData = sanitizeRecommendation({
            status: req.body.status,
            comment: req.body.comment,
            asset_id: req.asset.id
        })

        const recommendation =
            await RecommendationModel.createRecommendations({
                ...sanitizedData,
                user_id: req.user.id
            })

        return res.status(201).json({ recommendation })

    } catch (error) {
        console.error("CREATE ERROR:", error)

        return res.status(500).json({ message: error.message })
    }
}

// PUT /recommendations/:id
async function updateRecommendation(req, res) {
    try {
        const id = Number(req.params.id)

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ message: "Invalid ID" })
        }

        const sanitizedData = sanitizeRecommendationUpdate(req.body)

        if (Object.keys(sanitizedData).length === 0) {
            return res.status(400).json({ message: "Invalid data" })
        }

        const existing = await RecommendationModel.getRecommendationsById(id)

        if (!existing) {
            return res.status(404).json({ message: "Recommendation not found" })
        }

        // AUTHORIZATION
        if (req.user.role !== "admin" && existing.user_id !== req.user.id) {
            return res.status(403).json({ message: "Update denied" })
        }

        const recommendation = await RecommendationModel.updateRecommendations(id, sanitizedData)

        return res.status(200).json({ recommendation })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

// DELETE /recommendations/:id
async function deleteRecommendation(req, res) {
    try {
        const id = Number(req.params.id)

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({ message: "Invalid ID" })
        }

        const existing = await RecommendationModel.getRecommendationsById(id)

        if (!existing) {
            return res.status(404).json({ message: "Recommendation not found" })
        }

        // AUTHORIZATION
        if (req.user.role !== "admin" && existing.user_id !== req.user.id) {
            return res.status(403).json({ message: "Delete denied" })
        }

        await RecommendationModel.deleteRecommendations(id)

        return res.status(200).json({ message: "delete ok" })

    } catch (error) {
        return res.status(500).json({ message: error.message })
    }
}

async function getRecommendationsByAnalyst(req, res) {
    try {
        const { analystId } = req.params;
        const limit = Math.max(1, Number.parseInt(req.query.limit ?? 10, 10));
        const offset = Math.max(0, Number.parseInt(req.query.offset ?? 0, 10));

        const results = await RecommendationModel.getByAnalystId(analystId, limit, offset);
        
        const nextResults = await RecommendationModel.getByAnalystId(analystId, limit, offset + limit);
        const hasNext = nextResults.length > 0;

        return res.status(200).json({ results, hasNext });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

export default { 
    getRecommendationPagin, 
    getMyRecommendation, 
    createRecommendation, 
    updateRecommendation, 
    deleteRecommendation,
    getRecommendationsByAnalyst
}