import getConnection from "../db/connection.js"
import { hashPassword } from "../utils/password.js"

async function getUsers() {
    const db = getConnection()

    const [rows] = await db.query("SELECT id, name, email, role, analyst_type_id, analyst_verified, company, bio FROM users")

    return rows
}

async function getUsersById(id) {
    const db = getConnection()

    const sql = "SELECT id, name, email, role, analyst_type_id, analyst_verified, company, bio FROM users WHERE id = ?"

    const [result] = await db.execute(sql, [id])

    return result[0] || null
}

async function getUsersByEmail(email) {
    const db = getConnection()

    let sql = "SELECT id, name, email, password, role, analyst_type_id, analyst_verified, company, bio FROM users WHERE email = ?"
    const [result] = await db.execute(sql, [email]) 

    return result[0] || null
}

async function createUsers(data) {
    const db = getConnection()

    const { name, email, password, role, analyst_type_id, company, bio } = data

    const [existingEmail] = await db.execute("SELECT id FROM users WHERE email = ?",[email])

    if (existingEmail.length > 0) {throw new Error("Email already used")}

    const hashedPassword = await hashPassword(password)

    if (role === "analyst") {
        const [assetType] = await db.execute("SELECT id FROM assets_types WHERE id = ?", [analyst_type_id])

        if (assetType.length === 0) {
            throw new Error("Type d'actif invalide")
        }
    }

    const sql = "INSERT INTO users (name, email, password, role, analyst_type_id, analyst_verified, company, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"

    const [result] = await db.execute(sql,
        [name, email, hashedPassword, role, analyst_type_id, false, company, bio]
    )

    return {
        id: result.insertId,
        name,
        email,
        role
    }
}

async function updateUsers(id, data) {
    const db = getConnection()

    const fields = []
    const values = []

    if (data.name !== undefined) {
        fields.push("name = ?")
        values.push(data.name)
    }

    if (data.email !== undefined) {
        fields.push("email = ?")
        values.push(data.email)
    }

    if (data.password !== undefined) {
        const hashed = await hashPassword(data.password)
        fields.push("password = ?")
        values.push(hashed)
    }

    // admin only
    if (data.role !== undefined) {
        fields.push("role = ?")
        values.push(role)
    }

    if (data.analyst_type_id !== undefined) {
        const [assetType] = await db.execute(
            "SELECT id FROM assets_types WHERE id = ?",
            [data.analyst_type_id]
        )

        if (assetType.length === 0) {
            throw new Error("Invalid analyst type")
        }

        fields.push("analyst_type_id = ?")
        values.push(Number(data.analyst_type_id))
    }

    // admin only
    if (data.analyst_verified !== undefined) {
        fields.push("analyst_verified = ?")
        values.push(analyst_verified)
    }

    if (data.company !== undefined) {
        fields.push("company = ?")
        values.push(company)
    }

    if (data.bio !== undefined) {
        fields.push("bio = ?")
        values.push(bio)
    }

    if (fields.length === 0) {
        throw new Error("No fields to update")
    }

    values.push(id)

    const sql = `UPDATE users SET ${fields.join(", ")} WHERE id = ?`

    const [result] = await db.execute(sql, values)

    if (result.affectedRows === 0) {
        throw new Error("User not found")
    }

    return result
}

async function deleteUsers(id) {
    const db = getConnection()

    if (!Number.isInteger(Number(id))) {
        throw new Error("Invalid ID")
    }

    const sql = 'DELETE FROM users WHERE id = ?'

    const [result] = await db.execute(sql, [id])

    if (result.affectedRows === 0) {
        throw new Error("User not found")
    }

    return result
}

export default { getUsers, getUsersById, getUsersByEmail, createUsers, updateUsers, deleteUsers }