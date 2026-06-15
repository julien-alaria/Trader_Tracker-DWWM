import http from "../../../config/instanceHttp.js"

const register = ` 
        <h1>Register</h1>
        <form id="register-form">
            <label for="name">Nom:</label>
            <input type="text" id="name" name="name" minlength="2" maxlength="50" required autocomplete="on">

            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required autocomplete="on">

            <label for="password">Password:</label>
            <input type="password" id="password" name="password" minlength="6" maxlength="20" required autocomplete="on">

            <input type="submit" value="submit">
            <div id="message"></div>
        </form>
        <p>Register as Analyst ?</p>
        <a href="#/analystregister" class="btn">Register as Analyst</a>
        `;

  export function initRegister() {
    const form = document.querySelector("#register-form")

    const messageDiv = document.getElementById("message")

    form.addEventListener("submit", async function (e) {
        e.preventDefault()

        messageDiv.innerText = ""

        const data = new FormData(form)

        try {
            const result = await http.post("/auth/register", data)

            console.log("REGISTER OK:", result.token)

            if (result.token) {
                localStorage.setItem("token", result.token)

                messageDiv.innerText = "Registration successful."

                setTimeout(() => {
                    window.location.hash = "/"
                    window.dispatchEvent(new Event("hashchange"))
                }, 1000)
            } else {
                messageDiv.innerText = "Account created, but automatic login failed."
            }

        } catch (error) {
            messageDiv.innerText = error.response?.data?.message || "An error occurred during registration."
            console.error("Register failed:", error)
        }
    })
}

export default register
