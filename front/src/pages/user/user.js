import http from "../../config/instanceHttp.js"
import { decodeToken } from "../../middlewares/roleGuard.js";

const userPage = `
    <main>
        <h1>USER PAGE</h1>
        <div  id="user_name"></div>
        <div id="user_id"></div>
        <div id="user_email"></div>
    </main>
`

export async function initUser() {

    try {
        const token = localStorage.getItem("token")
        const payload = decodeToken(token);

        if (!payload) {
            window.location.hash = "/login"
            return
        }

        const response = await http.get(`/users/${payload.id}`)

        console.log("USER.JS", response)

        const user = response.result
        
        document.getElementById("root").innerHTML = userPage

        document.getElementById("user_id").innerHTML = "User ID: " + user.id
        document.getElementById("user_name").innerHTML = "User Name: " + user.name
        document.getElementById("user_email").innerHTML = "Email: " + user.email

    } catch (error) {
        console.error(error.message)
    }
}

export default userPage



