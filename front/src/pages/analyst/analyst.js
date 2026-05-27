import http from "../../config/instanceHttp.js"
import { decodeToken } from "../../middlewares/roleGuard.js";

const analystPage = `
    <main>
        <h1 >ANALYST PAGE</h1>
        <div id="analyst_name"></div>
        <div id="analyst_id"></div>
        <div id="analyst_email"></div>
        <div id="analyst_analystTypeId"></div>
        <div id="analyst_company"></div>
        <div id="analyst_bio"></div>
    </main>
`

export async function initAnalyst() {

    try {
        const token = localStorage.getItem("token")
        const payload = decodeToken(token);

        if (!payload) {
            window.location.hash = "/login"
            return
        }

        const response = await http.get(`/users/${payload.id}`)

        console.log("ANALYST.JS", response)

        const user = response.result
        
        document.getElementById("root").innerHTML = analystPage

        document.getElementById("analyst_id").textContent = "Analyst ID :" + user.id
        document.getElementById("analyst_name").textContent = "Analyst Name: " + user.name
        document.getElementById("analyst_email").textContent = "Email: " + user.email
        document.getElementById("analyst_analystTypeId").textContent = "Specaility: " + user.analyst_type_id
        document.getElementById("analyst_company").textContent = "Email: " + user.company
        document.getElementById("analyst_bio").textContent = "Bio: " + user.bio


    } catch (error) {
        console.error(error.message)
    }
}

export default analystPage