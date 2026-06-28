import { validateName, validateEmail, validatePassword, validateBio, validateCompany, safeRole, safePublicRole, validateAnalystType, validateComment, validateRecommendationStatus } from "../utils/validators.js"

export function sanitizeUser(data) {
    const { name, email, password, role, analyst_type_id, company, bio } = data

    if (!name || !email || !password) {
        throw new Error("Missing required fields")
    }

    const cleanName = validateName(name)
    const cleanEmail = validateEmail(email)
    const cleanPassword = validatePassword(password)
    const cleanBioValue = validateBio(bio)
    const cleanCompanyValue = validateCompany(company)
    const safeRoleValue = safePublicRole(role)
    const analystId = validateAnalystType(safeRoleValue, analyst_type_id)

    return {
        name: cleanName,
        email: cleanEmail,
        password: cleanPassword,
        role: safeRoleValue,
        analyst_type_id: analystId,
        company: cleanCompanyValue,
        bio: cleanBioValue
    }
}

export function sanitizeUserUpdate(data) {
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
        sanitized.role = safeRole(role)
    }

    if (analyst_type_id !== undefined) {
        sanitized.analyst_type_id = validateAnalystType(
            sanitized.role ?? role,
            analyst_type_id
        )
    }

    if (company !== undefined) {
        sanitized.company = validateCompany(company)
    }

    if (bio !== undefined) {
        sanitized.bio = validateBio(bio)
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

export function sanitizeRecommendation(data) {
    const { status, comment, asset_id } = data

    if (!status || !asset_id) {
        throw new Error("Missing required fields")
    }

    const assetId = Number(asset_id)
    
    if (!Number.isInteger(assetId) || assetId <= 0) {
        throw new Error("Invalid asset id")
    }

    const sanitizedData = {
        status: validateRecommendationStatus(status),
        comment: validateComment(comment),
        asset_id: assetId
    }

    return sanitizedData
}


export function sanitizeRecommendationUpdate(data) {
    const { status, comment } = data

    const sanitized = {}

    if (data.status !== undefined) {
        sanitized.status = validateRecommendationStatus(status)
    }

    if (data.comment !== undefined) {
        sanitized.comment = validateComment(comment)
    }

    return sanitized
}
