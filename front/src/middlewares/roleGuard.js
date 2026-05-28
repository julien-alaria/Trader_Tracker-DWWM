export function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split(".")[1]));
  } catch (e) {
    console.error("Token invalide :", e);
    return null;
  }
}

export function getRoleFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;

  const payload = decodeToken(token);

  return payload?.role || null;
}

export function roleGuard(allowedRoles = []) {
  const token = localStorage.getItem("token");

  if (!token) {
    window.location.hash = "/login";
    return false;
  }

  const role = getRoleFromToken();

  if (!allowedRoles.includes(role)) {
    window.location.hash = "/";
    return false;
  }

  return true;
}