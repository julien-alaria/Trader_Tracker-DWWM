import { validateName, validateEmail, validatePassword } from "../utils/validators.js"

export function sanitizeUser(data) {
    const { name, email, password, role, analyst_type_id, company, bio } = data

    if (!name || !email || !password) {
        throw new Error("Missing required fields")
    }

    const cleanBio = bio?.trim() ?? null
    if (cleanBio && cleanBio.length > 1000) {
        throw new Error("Bio trop longue")
    }

    const cleanCompany = company?.trim() ?? null
    if (cleanCompany && cleanCompany.length > 100) {
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
    }

    return {
        name: validateName(name),
        email: validateEmail(email),
        password: validatePassword(password),
        role: safeRole,
        analyst_type_id: safeRole === "analyst" ? Number(analyst_type_id) : null,
        company: cleanCompany,
        bio: cleanBio
    }
}

export function sanitizeUpdateUser(data) {
    const { name, email, password, role, analyst_type_id, company, bio } = data

    const sanitized = {}

    if (name !== undefined) {
        sanitized.name = validateName(name)
    }

    if (email !== undefined) {
        sanitized.email = validateEmail(email)
    }

    if (password !== undefined) {
        sanitized.password = validatePassword(password)
    }

    if (role !== undefined) {
        if (!["user", "analyst"].includes(role)) {
            throw new Error("Invalid role")
        }
        sanitized.role = role
    }

    if (analyst_type_id !== undefined) {
        if (!Number.isInteger(Number(analyst_type_id))) {
            throw new Error("Invalid analyst_type_id")
        }
        sanitized.analyst_type_id = Number(analyst_type_id)
    }

    if (company !== undefined) {
        const clean = company.trim()

        if (clean.length > 100) {
            throw new Error("Nom de société trop long")
        }
        sanitized.company = clean
    }

    if (bio !== undefined) {
        const clean = bio.trim()

        if (clean.length > 1000) {
            throw new Error("Bio trop longue")
        }
        sanitized.bio = clean
    }

    return sanitized
}

export function sanitizeLogin(data) {
    const { email, password } = data

    if (!email || !password) {
        throw new Error("Missing credentials")
    }

    const cleanEmail = validateEmail(email)

    return {
        email: cleanEmail,
        password
    }
}