import navLink from "../navLinks/navLink.js"

function getUser() {
  const token = localStorage.getItem("token")
  if (!token) return null

  try {
    const payload = JSON.parse(atob(token.split(".")[1]))

    if (payload.exp * 1000 < Date.now()) {
      localStorage.removeItem("token")
      return null
    }

    return payload
  } catch {
    return null
  }
}

export default function navbar() {

    const user = getUser()

    return `
        <nav>
            <p>NAVBAR</p>

            ${navLink("/", "Home")}
            ${navLink("/about", "About")}

            ${user ? "" : navLink("/login", "Login")}
            ${user ? "" : navLink("/register", "Register")}

            ${user?.role === "admin" ? navLink("/admin", "Admin") : ""}
            ${user?.role === "user" ? navLink("/user", "User") : ""}
            ${user?.role === "analyst" ? navLink("/analyst", "Analyst") : ""}

            ${user ? `<button id="logout-btn">Logout</button>` : ""}
        </nav>
    `
}

export function renderNavbar() {
  document.getElementById("nav").innerHTML = navbar()
}

export function bindNavbarEvents() {
  const btn = document.getElementById("logout-btn")

  if (btn) {
    btn.addEventListener("click", () => {
      localStorage.removeItem("token")
      window.location.hash = "/login"
    })
  }
}

