import http from "../../config/instanceHttp.js"
import { getRoleFromToken } from "../../middlewares/roleGuard.js";


const login = `  
        <h1>Log In</h1>
        <form id="login-form">
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" required autocomplete="on">

            <label for="password">Password:</label>
            <input type="password" id="password" name="password" required autocomplete="off">

            <input type="submit" value="submit">
            <div id="message"></div>
        </form>
        `;

    export function initLogin() {
        const form = document.querySelector("#login-form")

        const messageDiv = document.getElementById("message")

        form.addEventListener("submit", async function(e){
            e.preventDefault()

            messageDiv.innerText = ""
            
            const data = new FormData(form)

            try {
                const result = await http.post("/auth/login", {
                    email: data.get("email"),
                    password: data.get("password")
                })

                const token = result.token

                if (!token) {
                    messageDiv.innerText = "Login failed. Invalid server response."
                    return
                }

                localStorage.setItem("token", token)
                const role = getRoleFromToken(token)

                console.log("TOKEN :", token)
                console.log("ROLE :", role)

                if (!role) {
                    localStorage.removeItem("token")
                    messageDiv.innerText = "Login failed. Invalid role assignment."
                    return
                }

                messageDiv.innerText = "login successful."

                setTimeout(() => {

                    switch (role) {
                        case "admin":
                            window.location.hash = "/admin"
                            break
                        case "analyst":
                            window.location.hash = "/analyst"
                            break
                        default:
                            window.location.hash = "/user"
                    }

                    window.dispatchEvent(new Event("hashchange"))
                }, 1000)
                
            } catch (error) {
                messageDiv.innerText = error.response?.data?.message || "Invalid email or password."
                console.error("Login failed :", error)
            }
        })
    }

export default login