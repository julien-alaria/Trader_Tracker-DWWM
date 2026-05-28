import http from "../../../config/instanceHttp.js"

const register = ` 
        <h1>Register</h1>
        <form id="register-form">
            <label for="name">Nom:</label>
            <input type="text" id="name" name="name" required minlength="2" maxlength="50" autocomplete="on">

            <label for="email">Email:</label>
            <input type="email" id="email" name="email" autocomplete="on">

            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required minlength="6" maxlength="20" autocomplete="on">

            <input type="submit" value="submit">
        </form>
        <form action="/#/analystregister">
            <input type="submit" value="Register as Analyst" />
        </form>
        `;

  export function initRegister() {
    const form = document.querySelector("#register-form")

    form.addEventListener("submit", async function (e) {
        e.preventDefault()

        const data = new FormData(form)

        try {
            const result = await http.post("/auth/register", {
                name: data.get("name"),
                email: data.get("email"),
                password: data.get("password"),
            })

            console.log("REGISTER OK:", result.token)

            if (result.token) {
                localStorage.setItem("token", result.token)
                window.location.hash = "/"
                window.dispatchEvent(new Event("hashchange"))
            }

        } catch (error) {
            console.error("Register failed:", error)
        }
    })
}

export default register
