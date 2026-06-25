import navLink from "../navLinks/navLink.js"

export default function footer() {
    return `
        <p>FOOTER</p>
        ${navLink("/", "Home")}
        ${navLink("/register", "Register")}
        ${navLink("/login", "Login")}
        ${navLink("/about", "About")}
    `
}