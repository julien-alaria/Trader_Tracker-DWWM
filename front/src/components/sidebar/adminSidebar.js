import navLink from "../navLinks/navLink.js"
import { getAuthenticatedUser } from "../../middlewares/roleGuard.js"

export default function adminSidebar() {

    const user = getAuthenticatedUser()

    return `
        <aside class="admin-sidebar">
            <nav class="admin-nav">
                ${navLink("/about", "About")}
                ${navLink("/", "home")}
                ${navLink("/list", "list")}
                ${user ? `<button id="logout-btn">Logout</button>` : ""}

            </nav>
        </aside>
    `
}
