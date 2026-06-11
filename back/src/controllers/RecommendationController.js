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

        const results =
            await RecommendationModel.getAllRecommendations()

        return res.status(200).json({
            results
        })

    } catch (error) {
        return res.status(500).json({
            error: error.message
        })
    }
}

async function getRecommendationsPaginated(limit = 2, offset = 0) {
    const db = getConnection()

    const parsedLimit = Number.parseInt(limit, 10) || 2
    const parsedOffset = Number.parseInt(offset, 10) || 0

    const sql = `
        SELECT 
            r.id,
            r.status,
            r.comment,
            r.asset_id,
            r.user_id,
            u.name AS analyst_name
        FROM recommendations r
        JOIN users u ON u.id = r.user_id
        LIMIT ? OFFSET ?
    `

    const [rows] = await db.execute(sql, [parsedLimit, parsedOffset])
    return rows
}

async function getMyRecommendation(req, res) {
    try {
        const userId = req.user.id

        const results = await RecommendationModel.getMyRecommendations(userId)

        return res.status(200).json({ results })
    } catch (error) {
        return res.status(500).json({ error: error.message })
    }
}

/**
 * POST /recommendations
 */
async function createRecommendation(req, res) {
    try {
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

        const sanitizedData = sanitizeRecommendationUpdate(req.body)

        if (Object.keys(sanitizedData).length === 0) {
            return res.status(400).json({
                error: "Aucune donnée valide"
            })
        }

        const existing = await RecommendationModel.getRecommendationsById(id)

        if (!existing) {
            return res.status(404).json({
                error: "Recommendation not found"
            })
        }

        // AUTHORIZATION
        if (req.user.role !== "admin" && existing.user_id !== req.user.id) {
            return res.status(403).json({
                error: "Update denied"
            })
        }

        const recommendation = await RecommendationModel.updateRecommendations(id, sanitizedData)

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

        const existing = await RecommendationModel.getRecommendationsById(id)

        if (!existing) {
            return res.status(404).json({
                error: "Recommendation not found"
            })
        }

        // AUTHORIZATION
        if (req.user.role !== "admin" && existing.user_id !== req.user.id) {
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

export default { getRecommendation, getRecommendationsPaginated, getMyRecommendation, createRecommendation, updateRecommendation, deleteRecommendation }