import getConnection from "../db/connection.js"

async function getAssetById(id) {
    const db = getConnection()

    const [rows] = await db.execute(
        "SELECT id, ticker, asset_type_id FROM assets WHERE id = ?",
        [id]
    )

    return rows[0] || null
}

async function getAssetByTicker(ticker) {
    const db = getConnection()

    const [rows] = await db.execute(
        "SELECT id, ticker, asset_type_id FROM assets WHERE ticker = ?",
        [ticker]
    )

    return rows[0] || null
}

export default { getAssetById, getAssetByTicker }