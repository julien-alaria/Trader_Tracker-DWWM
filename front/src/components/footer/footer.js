import navLink from "../navLinks/navLink.js"

export default function footer() {
    return `
        <footer class="main-footer">
            <div class="footer-socials">
                <h2>TRADER TRACKER</h2>
                <a href="#" aria-label="X"><i class="fab fa-x-twitter"></i></a>
                <a href="#" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>
                <a href="#" aria-label="LinkedIn"><i class="fab fa-linkedin-in"></i></a>
                <a href="#" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                <a href="#" aria-label="RSS"><i class="fas fa-rss"></i></a>
            </div>

            <div class="footer-nav">
                ${navLink("/about", "ABOUT")}
            </div>

            <div class="footer-bottom">
                <span>© 2026 Trader Tracker. All rights reserved.</span>
            </div>
        </footer>
    `
}