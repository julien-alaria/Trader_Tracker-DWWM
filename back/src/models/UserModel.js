import getConnection from "../db/connection.js"

async function getUsers() {
    const db = getConnection()

    const [rows] = await db.query("SELECT * FROM users")

    return rows
}

export default { getUsers }