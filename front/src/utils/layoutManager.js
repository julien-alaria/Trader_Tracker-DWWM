import navbar from "../components/navbar/navbar.js"
import footer from "../components/footer/footer.js"
import adminSidebar from "../components/sidebar/adminSidebar.js"
import { bindLogoutEvent } from "../utils/logoutUtils.js"

bindLogoutEvent() //Single initialization for all logout events

export function renderApp(content, layoutType = "default") {
    const root = document.getElementById("root")
    const header = document.getElementById("header-container")
    const footerCont = document.getElementById("footer-container")
    const isAdminPage = (layoutType === "admin")

    document.body.className = isAdminPage ? "admin-mode" : ""

    header.innerHTML = isAdminPage ? "" : navbar()
    footerCont.innerHTML = isAdminPage ? "" : footer()

    root.innerHTML = isAdminPage ? `
        <div class="admin-layout">
            ${adminSidebar()}
            <div class="admin-content">${content}</div>
        </div>
    ` : content
}