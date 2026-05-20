import getConnection from "../db/connection.js"

async function getUsers() {
    const db = getConnection()

    const [rows] = await db.query("SELECT * FROM users")

    return rows
}

async function createUsers(data) {
    const db = getConnection()

    if (!data) { throw new Error("Missing user data") }

    const { name, email, password, role, analyst_type_id, company, bio } = data

    if (!name || !email || !password) { throw new Error("Missing required fields") }

    const [existingEmail] = await db.execute("SELECT id FROM users WHERE email = ?",[email])

    if (existingEmail.length > 0) {throw new Error("Email already exists")}


    const safeRole = role || "user"
    const safeAnalystTypeId = analyst_type_id || null
    const safeCompany = company || null
    const safeBio = bio || null
    const analystVerified = false

    const [result] = await db.execute(
        "INSERT INTO users (name, email, password, role, analyst_type_id, analyst_verified, company, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
        [name, email, password, safeRole, safeAnalystTypeId, analystVerified, safeCompany, safeBio]
    )

    return {
        id: result.insertId,
        name,
        email,
        role: safeRole
    }
}

export default { getUsers, createUsers }