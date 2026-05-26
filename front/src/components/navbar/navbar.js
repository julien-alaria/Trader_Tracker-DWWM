import navLink from "../navLinks/navLink.js";

export default function navbar(link, label) {
    return `
            <p>NAVBAR</>
            ${navLink("/", "Home")}
            ${navLink("/register", "Register")}
            ${navLink("/login", "Login")}
            ${navLink("/about", "About")}
        `
}
