import RecommendationModel from "../models/RecommendationModel.js"
import AssetModel from "../models/AssetModel.js"
import { sanitizeRecommendation, sanitizeRecommendationUpdate } from "../utils/sanitizer.js"

/**
 * GET /recommendations
 * - option: ?ticker=MSFT (filter asset)
 * - sinon pagination
 */
async function getRecommendation(req, res) {
    try {
        const { ticker } = req.query

        // FILTER BY ASSET (ticker)
        if (ticker) {
            const asset = await AssetModel.getAssetByTicker(ticker)

            if (!asset) {
                return res.status(404).json({
                    error: "Asset not found"
                })
            }

            const results =
                await RecommendationModel.getRecommendationsByAssetId(asset.id)

            return res.status(200).json({
                results
            })
        }

        // PAGINATION MODE
        let page = Number(req.query.page) || 1
        let limit = Number(req.query.limit) || 10

        if (!Number.isInteger(page) || page < 1) page = 1
        if (!Number.isInteger(limit) || limit < 1) limit = 10
        if (limit > 50) limit = 50

        const offset = (page - 1) * limit

        const results =
            await RecommendationModel.getPaginated(limit, offset)

        return res.status(200).json({
            page,
            limit,
            results
        })

    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
}

/**
 * POST /recommendations
 */
async function createRecommendation(req, res) {
    try {
        // sécurité middleware obligatoire
        if (!req.asset) {
            return res.status(400).json({
                error: "Asset not resolved"
            })
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

        return res.status(201).json({
            recommendation
        })

    } catch (error) {
        console.error("CREATE ERROR:", error)

        return res.status(500).json({
            error: error.message
        })
    }
}

/**
 * PUT /recommendations/:id
 */
async function updateRecommendation(req, res) {
    try {
        const id = Number(req.params.id)

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: "ID invalide"
            })
        }

        const sanitizedData =
            sanitizeRecommendationUpdate(req.body)

        if (Object.keys(sanitizedData).length === 0) {
            return res.status(400).json({
                error: "Aucune donnée valide"
            })
        }

        const existing =
            await RecommendationModel.getRecommendationsById(id)

        if (!existing) {
            return res.status(404).json({
                error: "Recommendation not found"
            })
        }

        // AUTHORIZATION
        if (
            req.user.role !== "admin" &&
            existing.user_id !== req.user.id
        ) {
            return res.status(403).json({
                error: "Update denied"
            })
        }

        const recommendation =
            await RecommendationModel.updateRecommendations(id, sanitizedData)

        return res.status(200).json({
            recommendation
        })

    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
}

/**
 * DELETE /recommendations/:id
 */
async function deleteRecommendation(req, res) {
    try {
        const id = Number(req.params.id)

        if (!Number.isInteger(id) || id <= 0) {
            return res.status(400).json({
                error: "Invalid ID"
            })
        }

        const existing =
            await RecommendationModel.getRecommendationsById(id)

        if (!existing) {
            return res.status(404).json({
                error: "Recommendation not found"
            })
        }

        // AUTHORIZATION
        if (
            req.user.role !== "admin" &&
            existing.user_id !== req.user.id
        ) {
            return res.status(403).json({
                error: "Delete denied"
            })
        }

        await RecommendationModel.deleteRecommendations(id)

        return res.status(200).json({
            message: "delete ok"
        })

    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
}

export default { getRecommendation, createRecommendation, updateRecommendation, deleteRecommendation }