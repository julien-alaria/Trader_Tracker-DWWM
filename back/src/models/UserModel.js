import getConnection from "../db/connection.js"
import { hashPassword } from "../utils/password.js"
import { validateName, validateEmail, validatePassword } from "../utils/validators.js"

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

    // name security
    const cleanName = validateName(name)

    // mail security
    const cleanEmail = validateEmail(email)

    const [existingEmail] = await db.execute("SELECT id FROM users WHERE email = ?",[cleanEmail])

    if (existingEmail.length > 0) {throw new Error("Account creation is refused")}

    // password security
    validatePassword(password)

    const hashedPassword = await hashPassword(password)

    // bio security
    const cleanBio = bio ? bio.trim() : null
    if (cleanBio && cleanBio.length > 1000) {
        throw new Error("Bio trop longue")
    }

    // company security  
    const cleanCompany = company ? company.trim() : null
    if(cleanCompany && cleanCompany.length > 100) {
        throw new Error("Nom de société trop long")
    }

    const safeRole = role === "analyst" ? "analyst" : "user"

    if (safeRole === "analyst") {
        if (!analyst_type_id) {
            throw new Error("Type analyst requis")
        }

        if (!Number.isInteger(Number(analyst_type_id))) {
            throw new Error("Type d'actif invalide")
        }

        const [assetType] = await db.execute("SELECT id FROM assets_types WHERE id = ?", [analyst_type_id])

        if (assetType.length === 0) {
            throw new Error("Type d'actif invalide")
        }
    }

    const safeAnalystTypeId = safeRole === "analyst" ? Number(analyst_type_id) : null
    const safeCompany = cleanCompany || null
    const safeBio = cleanBio || null
    const analystVerified = false

    let sql = "INSERT INTO users (name, email, password, role, analyst_type_id, analyst_verified, company, bio) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"

    const [result] = await db.execute(sql,
        [cleanName, cleanEmail, hashedPassword, safeRole, safeAnalystTypeId, analystVerified, safeCompany, safeBio]
    )

    return {
        id: result.insertId,
        name: cleanName,
        email: cleanEmail,
        role: safeRole
    }
}

async function updateUsers(id, data) {
    const db = getConnection()

    if (!Number.isInteger(Number(id))) throw new Error("ID invalide")

    const { name, email, password, role, analyst_type_id, analyst_verified, company, bio } = data

    let cleanName
    if (name) cleanName = validateName(name)

    let cleanEmail
    if (email) cleanEmail = validateEmail(email)

    let hashedPassword;
    if (password) { 
        hashedPassword = await hashPassword(password)
    } else {
        hashedPassword = "1234"
    }
    
    let sql = 'UPDATE users SET name = ?, email = ?, password = ?, role = ?, analyst_type_id = ?, analyst_verified = ?, company = ?, bio = ? WHERE id = ?'

    const [result] = await db.execute(sql, [cleanName ?? null, cleanEmail ?? null, hashedPassword, role ?? null, analyst_type_id ?? null, analyst_verified ?? null, company ?? null, bio ?? null, id])

    return result

}

async function deleteUsers(id) {
    const db = getConnection()

    if (!Number.isInteger(Number(id))) throw new Error("ID invalide")

    let sql = 'DELETE FROM users WHERE id = ?'

    const [result] = await db.execute(sql, [id])

    return result

}

export default { getUsers, getUsersById, getUsersByEmail, createUsers, updateUsers, deleteUsers }