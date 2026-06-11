import getConnection from "../db/connection.js"

async function getRecommendations(){
    const db = getConnection()

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
    `

    const [rows] = await db.query(sql)

    return rows
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

async function getMyRecommendations(userId){
    const db = getConnection()

    const sql = `
    SELECT
        r.id,
        r.status,
        r.comment,
        r.created_at,
        r.asset_id,
        r.user_id, 
        a.ticker,
        a.name
    FROM recommendations r
    JOIN assets a
        ON a.id = r.asset_id
    WHERE r.user_id = ?
    ORDER BY r.created_at DESC
    `

    const [rows] = await db.execute(sql, [userId])

    return rows
}

async function getAllRecommendations() {
    const db = getConnection()

    const sql = `
        SELECT  
            r.id,
            r.status,
            r.comment,
            r.created_at,
            r.asset_id,
            r.user_id,
            a.ticker,
            a.name,
            u.name AS analyst_name
        FROM recommendations r
        JOIN assets a
        ON a.id = r.asset_id
        JOIN users u ON u.id = r.user_id
        ORDER BY r.id DESC

    `

    const [rows] = await db.query(sql)

    return rows
}

async function getRecommendationsById(id) {
    const db = getConnection()

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
        WHERE r.id = ?
    `

    const [result] = await db.execute(sql, [id])

    return result[0] || null
}

async function getRecommendationsByAssetId(assetId) {
    const db = getConnection()

    const sql = `
        SELECT 
            r.id,
            r.status,
            r.comment,
            r.asset_id,
            r.user_id,
            r.created_at,
            u.name AS analyst_name
        FROM recommendations r
        JOIN users u ON u.id = r.user_id
        WHERE r.asset_id = ?
        ORDER BY r.created_at DESC
    `

    const [rows] = await db.execute(sql, [assetId])

    return rows
}

async function createRecommendations(data) {
    const db = getConnection()

    const { status, comment, asset_id, user_id } = data

    const sql = "INSERT INTO recommendations (status, comment, asset_id, user_id) VALUES (?, ?, ?, ?)"

    const [result] = await db.execute(sql, [status, comment, asset_id, user_id])

    return {
        id: result.insertId,
        status,
        comment,
        asset_id,
        user_id
    }
}

async function updateRecommendations(id, data){
      const db = getConnection()

    const fields = []
    const values = []

    if (data.status !== undefined) {
        fields.push("status = ?")
        values.push(data.status)
    }

    if (data.comment !== undefined) {
        fields.push("comment = ?")
        values.push(data.comment)
    }

    if (fields.length === 0) {
        throw new Error("No fields to update")
    }

    values.push(id)

    const sql = `UPDATE recommendations SET ${fields.join(", ")} WHERE id = ?`

    const [result] = await db.execute(sql, values)

    if (result.affectedRows === 0) {
        throw new Error("Recommendation not found")
    }

    return result
}

async function deleteRecommendations(id){
    const db = getConnection()

    if (!Number.isInteger(Number(id))) {
        throw new Error("Invalid ID")
    }

    const sql = 'DELETE FROM recommendations WHERE id = ?'

    const [result] = await db.execute(sql, [id])

    if (result.affectedRows === 0) {
        throw new Error("Recommendation not found")
    }

    return result

}

export default { getRecommendations, getRecommendationsPaginated, getMyRecommendations, getRecommendationsById, getAllRecommendations, getRecommendationsByAssetId, createRecommendations, updateRecommendations, deleteRecommendations }

