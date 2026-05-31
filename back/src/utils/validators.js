export function validateName(name) {
    if (!name) throw new Error("Name required")

    const clean = name.trim()
    
    const reg = /^[a-zA-ZÀ-ÿ0-9 _'-]{2,50}$/
    if (!reg.test(clean)) {
        throw new Error("Invalid name")
    }

    return clean
}

export function validateEmail(email) {
    if (!email) throw new Error("Email required")

    const clean = email.trim().toLowerCase()

    const reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!reg.test(clean)) {
        throw new Error("Invalid email")
    }

    return clean
}

export function validatePassword(password) {
    if (!password) throw new Error("Password required")

    const reg = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\da-zA-Z])\S{6,20}$/

    if (!reg.test(password)) {
        throw new Error("Invalid password")
    }

    return password
}

export function validateBio(bio) {
    const clean = bio ? bio.trim() : null

    if (clean && clean.length > 1000) {
        throw new Error("Bio too long")
    }

    return clean
}

export function validateCompany(company) {
    const clean = company ? company.trim() : null

    if (clean && clean.length > 100) {
        throw new Error("Company name too long")
    }

    return clean
}

export function safeRole(role) {
    return role === "analyst" ? "analyst" : "user"
}

export function validateAnalystType(role, analyst_type_id) {
    if (role !== "analyst") {
        return null
    }

    if (analyst_type_id === undefined || analyst_type_id === null) {
        throw new Error("Analyst type required")
    }

    const id = Number(analyst_type_id)

    if (!Number.isInteger(id) || id <= 0) {
        throw new Error("Invalid asset type")
    }

    return id
}

export function validateComment(comment) {
    const clean = comment ? comment.trim() : null

    if (clean && clean.length > 1000) {
        throw new Error("Comment too long")
    }

    return clean
}

export function validateRecommendationStatus(status) {

    const allowed = ["BUY", "SELL", "HOLD"]

    if (!allowed.includes(status)) {
        throw new Error("Invalid recommendation status")
    }

    return status
}
