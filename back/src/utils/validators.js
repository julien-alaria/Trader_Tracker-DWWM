export function validateName(name) {
    if (!name) throw new Error("Nom requis")

    const clean = name.trim()

    if (clean.length > 50) {
        throw new Error("Nom trop long")
    }

    const reg = /^[a-zA-ZÀ-ÿ0-9 _'-]{2,50}$/
    if (!reg.test(clean)) {
        throw new Error("Nom invalide")
    }

    return clean
}

export function validateEmail(email) {
    if (!email) throw new Error("Email requis")

    const clean = email.trim().toLowerCase()

    const reg = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!reg.test(clean)) {
        throw new Error("Email invalide")
    }

    return clean
}

export function validatePassword(password) {
    if (!password) throw new Error("Mot de passe requis")

    const reg = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^\da-zA-Z])\S{6,20}$/

    if (!reg.test(password)) {
        throw new Error("Mot de passe invalide")
    }

    return password
}



