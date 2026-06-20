import navbar from "../components/navbar/navbar.js"
import footer from "../components/footer/footer.js"
import adminSidebar from "../components/sidebar/adminSidebar.js"
import { bindLogoutEvent } from "../utils/logoutUtils.js"

bindLogoutEvent() //Single initialization for all logout events

export function renderApp(content, type = "default") {
    const headerContainer = document.getElementById("header-container")
    const root = document.getElementById("root")
    const footerContainer = document.getElementById("footer-container")

    document.body.className = (type === "admin") ? "admin-mode" : ""

    if (type === "admin") {
        headerContainer.innerHTML = ""
    } else {
        headerContainer.innerHTML = navbar()
    }

    footerContainer.innerHTML = (type === "admin") ? "" : footer()

    if (type === "admin") {
        root.innerHTML = `
            <div class="admin-layout">
                ${adminSidebar()}
                <div class="admin-content">${content}</div>
            </div>
        `
    } else {
        root.innerHTML = content
    }
}