import http from "../../config/instanceHttp.js"
import { decodeToken } from "../../middlewares/roleGuard.js";

const userPage = `
    <main>
        <h1 id="user_name">USER PAGE</h1>
        <div id="user_id"></div>
        <div id="user_email"></div>
        <div id="user_analystTypeId"></div>
        <div id="user_company"></div>
        <div id="user_bio"></div>
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

        document.getElementById("user_id").innerHTML = user.id
        document.getElementById("user_name").innerHTML = user.name
        document.getElementById("user_email").innerHTML = user.email

    } catch (error) {
        console.error(error.message)
    }
}

export default userPage



