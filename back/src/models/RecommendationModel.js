import getConnection from "../db/connection.js"

async function getRecommendations(){
    const db = getConnection()

    const [rows] = await db.query("SELECT id, status, comment, asset_id, user_id FROM recommendations")

    return rows
}

async function getMyRecommendations(userId){
    const db = getConnection()

    const sql = "SELECT id, status, comment, asset_id, user_id FROM recommendations WHERE id = ?"

    const [result] = await db.execute(sql, [userId])

    return result[0] || null
}

async function getRecommendationsById(id) {
    const db = getConnection()

    const sql = "SELECT id, status, comment, asset_id, user_id FROM recommendations WHERE id = ?"

    const [result] = await db.execute(sql, [id])

    return result[0] || null
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

    if (data.asset_id !== undefined) {
        fields.push("asset_id = ?")
        values.push(data.asset_id)
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

export default { getRecommendations, getMyRecommendations, getRecommendationsById,createRecommendations, updateRecommendations, deleteRecommendations }

