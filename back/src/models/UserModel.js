import getConnection from "../db/connection.js"
import { hashPassword } from "../utils/password.js"

async function getUsers() {
    const db = getConnection()

    const [rows] = await db.query("SELECT * FROM users")

    return rows
}

async function getUsersById(id) {
    const db = getConnection()

    let sql = "SELECT * FROM users WHERE id = ?"
    const [result] = await db.execute(sql, [id])

    return result[0]
}

async function getUsersByEmail(email) {
    const db = getConnection()

    let sql = "SELECT * FROM users WHERE email = ?"
    const [result] = await db.execute(sql, [email]) 

    return result[0]
}

async function createUsers(data) {
    const db = getConnection()

    if (!data) { throw new Error("Missing user data") }

    const { name, email, password, role, analyst_type_id, company, bio } = data

    if (!name || !email || !password) { throw new Error("Missing required fields") }

    const [existingEmail] = await db.execute("SELECT id FROM users WHERE email = ?",[email])

    if (existingEmail.length > 0) {throw new Error("Email already exists")}

    const hashedPassword = await hashPassword(password)

    const safeRole = role || "user"
    const safeAnalystTypeId = analyst_type_id || null
    const safeCompany = company || null
    const safeBio = bio || null
    const analystVerified = false

    let sql = "INSERT INTO users (name, email, password, role, analyst_type_id, analyst_verified, company, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"

    const [result] = await db.execute(sql,
        [name, email, hashedPassword, safeRole, safeAnalystTypeId, analystVerified, safeCompany, safeBio]
    )

    return {
        id: result.insertId,
        name,
        email,
        role: safeRole
    }
}

async function updateUsers(id, data) {
    const db = getConnection()

    const { name, email, password, role, analyst_type_id, analyst_verified, company, bio } = data

    let hashedPassword;
    if (password) { 
        hashedPassword = await hashPassword(password)
    } else {
        hashedPassword = "1234"
    }
    
    let sql = 'UPDATE users SET name = ?, email = ?, password = ?, role = ?, analyst_type_id = ?, analyst_verified = ?, company = ?, bio = ? WHERE id = ?'

    const [result] = await db.execute(sql, [name ?? null, email ?? null, hashedPassword, role ?? null, analyst_type_id ?? null, analyst_verified ?? null, company ?? null, bio ?? null, id])

    return result

}

async function deleteUsers(id) {
    const db = getConnection()

    let sql = 'DELETE FROM users WHERE id = ?'

    const [result] = await db.execute(sql, [id])

    return result

}

export default { getUsers, getUsersById, getUsersByEmail, createUsers, updateUsers, deleteUsers }