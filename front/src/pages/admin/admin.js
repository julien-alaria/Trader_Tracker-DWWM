import http from "../../config/instanceHttp.js"
import { decodeToken } from "../../middlewares/roleGuard.js";

const adminPage = `
    <main>
        <h1>ADMIN PAGE</h1>
        <div  id="admin_name"></div>
        <div id="admin_id"></div>
        <div id="admin_email"></div>
    </main>
`

export async function initAdmin() {

    try {
        const token = localStorage.getItem("token")

        if (!token) return

        const payload = decodeToken(token);

        if (!payload) {
            window.location.hash = "/login"
            return
        }

        const response = await http.get(`/users/${payload.id}`)

        console.log("ADMIN.JS", response)

        const user = response.result
        
        document.getElementById("admin_id").innerHTML = "Admin ID: " + user.id
        document.getElementById("admin_name").innerHTML = "Admin Name: " + user.name
        document.getElementById("admin_email").innerHTML = "Admin Email: " + user.email

    } catch (error) {
        console.error(error.message)
    }
}

export default adminPage