import http from "../../../config/instanceHttp.js"

// =====================
// HTML TEMPLATE 
// =====================
const analystRegister = `
    <form method="post" id="analyst-form" enctype="multipart/form-data">
        <label for="name">Analyst Name:</label>
        <input type="text" id="name" name="name" required minlength="2" maxlength="50" autocomplete="on">

        <label for="email">Analyst Email:</label>
        <input type="email" id="email" name="email" required autocomplete="on">

        <label for="password">Analyst Password:</label>
        <input type="password" id="password" name="password" minlength="6" maxlength="20" required autocomplete="on">

        <label for="company">Analyst Company:</label>
        <input type="text" id="company" name="company" maxlength="1000" autocomplete="on">

        <label for="bio">Analyst Biography:</label>
        <textarea id="bio" name="bio" rows="5" cols="33" maxlength="100"></textarea>

        <input type="hidden" id="role" name="role" value="analyst" />

        <fieldset>
            <p>Select your asset type :</p>
            <div>
                <input type="radio" id="asset-type1" name="analyst_type_id" value="1" required />
                <label for="asset-type1">Forex</label>

                <input type="radio" id="asset-type2" name="analyst_type_id" value="2" required />
                <label for="asset-type2">Nasdaq</label>

                <input type="radio" id="asset-type3" name="analyst_type_id" value="3" required />
                <label for="asset-type3">Comex</label>
            </div>
        </fieldset>

        <label for="picture">Profile Picture (Image):</label>
        <input type="file" id="picture" name="picture" accept="image/*" />

        <label for="document">Certification (PDF):</label>
        <input type="file" id="document" name="document" accept=".pdf" />

        <input type="submit" value="submit">
        <div id="message"></div>
    </form>
    `

export default analystRegister

// =====================
// INIT
// =====================
export async function initAnalystRegister() {
    try {
        // security waiting before DOM injection
        await new Promise(resolve => setTimeout(resolve, 0))

        const form = document.getElementById("analyst-form")
        const messageDiv = document.getElementById("message")

        if (!form || !messageDiv) return

        form.addEventListener("submit", async function (e) {
            e.preventDefault()
            messageDiv.innerText = ""

            const data = new FormData(form)

            try {
                const result = await http.post("/auth/register", data)
                console.log("REGISTER OK:", result)

                if (result?.token) {
                    localStorage.setItem("token", result.token)
                    messageDiv.innerText = "Registration successful. Redirecting..."

                    setTimeout(() => {
                        window.location.hash = "#/" // Adding '#' for router
                    }, 1000)
                } else {
                    messageDiv.innerText = "Account created, but automatic login failed."
                }
                
            } catch (error) {
                messageDiv.innerText = error.message || error.response?.data?.message || "An error occurred during analyst registration."
                console.error("Register failed:", error)
            }
        })
    } catch (err) {
        console.error("INIT REGISTER ERROR:", err)
    }
}