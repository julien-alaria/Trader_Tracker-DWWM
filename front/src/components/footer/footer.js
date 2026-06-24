import navLink from "../navLinks/navLink.js"

export default function footer() {
    return `
        <footer class="main-footer">
            <div class="footer-nav">
                ${navLink("/", "Home")}
                ${navLink("/register", "Register")}
                ${navLink("/login", "Login")}
                ${navLink("/about", "About")}
            </div>

            <div class="footer-disclaimer">
                <p>Avertissement : Trading financial assets (stocks, forex, commodities) involves high risks.</p> 
                <p>The analyses provided by our experts do not constitute investment advice.</p>
            </div>

            <div class="footer-bottom">
                <span>© 2026 Trader Tracker. All rights reserved.</span>
            </div>
        </footer>
    `
}