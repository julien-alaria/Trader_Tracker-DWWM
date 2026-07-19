import AppError from "./AppError.js"

export function validateName(name) {
    if (!name) throw new AppError("Name required")

    const clean = name.trim()
    
    //validates that a string is between 2 and 50 characters long and that each character is either a letter (with or without an accent), a digit, or a space, underscore, apostrophe, or hyphen— nothing else (no symbols like @, #, %, no emojis...).
    const reg = /^[a-zA-ZÀ-ÿ0-9 _'-]{2,50}$/
    if (!reg.test(clean)) {
        throw new AppError("Invalid name")
    }

    return clean
}

export function validateEmail(email) {
    if (!email) throw new AppError("Email required")

    const clean = email.trim().toLowerCase()

    //validates that a string has the general shape of an email (text@text.text) — one or more characters, an @, one or more characters, a dot, one or more characters — with no spaces or extra @ allowed.
    const reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!reg.test(clean)) {
        throw new AppError("Invalid email")
    }

    return clean
}

export function validatePassword(password) {
    if (!password) throw new AppError("Password required")

    const clean = password.trim()

    //validates that a string is 6 to 20 characters long, contains no whitespace, and includes at least one digit, one lowercase letter, one uppercase letter, and one non-alphanumeric character — all four required, in any order or position.
    const reg = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\da-zA-Z])\S{6,20}$/

    if (!reg.test(clean)) {
        throw new AppError("Invalid password")
    }

    return clean
}

export function validateBio(bio) {
    const clean = bio ? bio.trim() : null

    if (clean && clean.length > 1000) {
        throw new AppError("Bio too long")
    }

    return clean
}

export function validateCompany(company) {
    const clean = company ? company.trim() : null

    if (clean && clean.length > 100) {
        throw new AppError("Company name too long")
    }

    return clean
}

// Used for ADMIN-ONLY routes (e.g. PUT /users/:id), where an admin
// is allowed to promote/demote any user, including to "admin".
export function safeRole(role) {
    const allowed = ["user", "analyst", "admin"]
    return allowed.includes(role) ? role : "user"
}

// Used for PUBLIC self-registration (POST /auth/register).
// "admin" is intentionally excluded
export function safePublicRole(role) {
    const allowed = ["user", "analyst"]
    return allowed.includes(role) ? role : "user"
}

export function validateAnalystType(role, analyst_type_id) {
    if (role !== "analyst") {
        return null
    }

    if (analyst_type_id === undefined || analyst_type_id === null) {
        throw new AppError("Analyst type required")
    }

    const id = Number(analyst_type_id)

    if (!Number.isInteger(id) || id <= 0) {
        throw new AppError("Invalid asset type")
    }

    return id
}

export function validateComment(comment) {
    const clean = comment ? comment.trim() : null

    if (clean && clean.length > 280) {
        throw new AppError("A recommendation must not exceed 280 characters")
    }

    return clean
}

export function validateRecommendationStatus(status) {

    const allowed = ["BUY", "SELL", "HOLD"]

    if (!allowed.includes(status)) {
        throw new AppError("Invalid recommendation status")
    }

    return status
}
