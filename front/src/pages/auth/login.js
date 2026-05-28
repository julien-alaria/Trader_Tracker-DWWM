import http from "../../config/instanceHttp.js"
import { getRoleFromToken } from "../../middlewares/roleGuard.js";


const login = `  
        <h1>Log In</h1>
        <form id="login-form">
            <label for="email">Email:</label>
            <input type="email" id="email" name="email" autocomplete="on">

            <label for="password">Password:</label>
            <input type="password" id="password" name="password" autocomplete="off">

            <input type="submit" value="submit">
        </form>
        `;

    export function initLogin() {
        const form = document.querySelector("#login-form")

        form.addEventListener("submit", async function(e){
            e.preventDefault()
            
            const data = new FormData(form)
            
            const email = data.get("email")
            const password = data.get("password")

            try {
                const result = await http.post("/auth/login", {
                    email,
                    password
                })

                const token = result.token
                localStorage.setItem("token", token)

                const role = getRoleFromToken(token)

                console.log("TOKEN :", token)
                console.log("ROLE :", role)

                if (!role) {
                    window.location.hash = "/login"
                    return
                }

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

            } catch (error) {
                console.error("Login failed :", error)
            }
        })
    }

export default login