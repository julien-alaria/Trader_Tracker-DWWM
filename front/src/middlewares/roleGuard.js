function base64UrlDecode(str) {
    const base64 = str.replace(/-/g, "+").replace(/_/g, "/")
    return atob(base64)
}


export function decodeToken(token) {
  try {

    if (!token) {
      return null
    }
    
    return JSON.parse(base64UrlDecode(token.split(".")[1])) 
  } catch (e) {
    console.error("Invalid token :", e)
    return null
  }
}

export function getRoleFromToken(token = null) {
  const currentToken = token || localStorage.getItem("token")

  if (!currentToken) return null

  const payload = decodeToken(currentToken)

  return payload?.role || null
}

export function roleGuard(allowedRoles = []) {
  const token = localStorage.getItem("token")

  if (!token) {
    window.location.hash = "/login"
    return false
  }

  const role = getRoleFromToken()

  if (!allowedRoles.includes(role)) {
    window.location.hash = "/"
    return false
  }

  return true
}

export function getAuthenticatedUser() {
  const token = localStorage.getItem("token")
  if (!token) return null

  const payload = decodeToken(token)
  if (!payload) return null

  if (payload.exp * 1000 < Date.now()) {
    localStorage.removeItem("token")
    return null
  }

  return payload
}
