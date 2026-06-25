import http from "../../../config/instanceHttp.js"

// =====================
// HTML TEMPLATE 
// =====================
const register = ` 
    <h1>Register</h1>
    <form id="register-form">
        <label for="name">Nom:</label>
        <input type="text" id="name" name="name" placeholder="Nom" minlength="2" maxlength="50" required autocomplete="on">

        <label for="email">Email:</label>
        <input type="email" id="email" name="email" placeholder="Email" required autocomplete="on">

        <label for="password">Password:</label>
        <input type="password" id="password" name="password" placeholder="Password" minlength="6" maxlength="20" required autocomplete="on">

        <input type="submit" value="submit">
        <div id="message"></div>
    </form>
    <p>Register as Analyst ?</p>
    <a href="#/analystregister" class="btn">Register as Analyst</a>
    `

export default register

// =====================
// INIT
// =====================
export async function initRegister() {
    try {
        // security waiting before DOM injection
        await new Promise(resolve => setTimeout(resolve, 0))

        const form = document.querySelector("#register-form")
        const messageDiv = document.getElementById("message")

        if (!form || !messageDiv) return

        form.addEventListener("submit", async function (e) {
            e.preventDefault()
            messageDiv.innerText = ""

            const data = new FormData(form)

            try {
                const result = await http.post("/auth/register", data)
                console.log("REGISTER OK:", result?.token)

                if (result?.token) {
                    localStorage.setItem("token", result.token)
                    messageDiv.innerText = "Registration successful. Redirecting..."

                    setTimeout(() => {
                        window.location.hash = "#/"
                    }, 1000);
                } else {
                    messageDiv.innerText = "Account created, but automatic login failed."
                }

            } catch (error) {
                messageDiv.innerText = error.message || error.response?.data?.message || "An error occurred during registration."
                console.error("Register failed:", error)
            }
        })
    } catch (err) {
        console.error("INIT REGISTER ERROR:", err)
    }
}