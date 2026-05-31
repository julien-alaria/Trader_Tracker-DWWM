import http from "../../config/instanceHttp.js"
import { decodeToken } from "../../middlewares/roleGuard.js"
import stockCard from "../../components/home/cards/stockCards.js"
import { getStock, getForex, getCommodities } from "../utils/assetsUtils.js"
import { loadTradingViewChart } from "../../utils/tradingChart.js"
import analystUpdateForm from "../../components/user/analystUpdateForm.js"

const analystPage = `
    <main>
        <h1 >ANALYST PAGE</h1>
        <div id="analyst_name"></div>
        <div id="analyst_id"></div>
        <div id="analyst_email"></div>
        <div id="analyst_analystTypeId"></div>
        <div id="analyst_company"></div>
        <div id="analyst_bio"></div>
        <h2>My Watchlist</h2>
        <div id="watchlist"></div>
        <div class="update-form">${analystUpdateForm()}</div>
    </main>
`

export async function initAnalyst() {

    try {
        const token = localStorage.getItem("token")

        if (!token) return
        
        const payload = decodeToken(token);

        if (!payload) {
            window.location.hash = "/login"
            return
        }
 
        const [userRes, watchRes, stocks, forex, commodities] = await Promise.all([
            http.get("/users/me"),
            http.get("/users/me/watchlist"),
            getStock(),
            getForex(),
            getCommodities()
        ])

        const allAssets = [...stocks, ...forex, ...commodities]
      
        const user = userRes.result

        document.getElementById("analyst_id").textContent = "Analyst ID :" + user.id
        document.getElementById("analyst_name").textContent = "Analyst Name: " + user.name
        document.getElementById("analyst_email").textContent = "Email: " + user.email
        document.getElementById("analyst_analystTypeId").textContent = "Speciality: " + user.analyst_type_id
        document.getElementById("analyst_company").textContent = "Company: " + user.company
        document.getElementById("analyst_bio").textContent = "Bio: " + user.bio

        const container = document.getElementById("watchlist")
        
            const watchlist = watchRes.result.map(w => {
                const full = allAssets.find(a => a.ticker === w.ticker)
    
                return {
                    ...w,
                    ...full,
                    isFollowed: true
                }
            })
    
            if (!watchlist.length) {
                container.innerHTML = "<p>No favorites yet</p>"
                return
            }
    
            container.innerHTML = watchlist.map(asset =>
                stockCard({
                    ...asset,
                    isFollowed: true
                })
            ).join("")
    
            //affichage chart
            watchlist.forEach(asset => {
                loadTradingViewChart(asset.ticker)
            })
    
            document.querySelectorAll(".card").forEach(card => {
    
                card.addEventListener("click", () => {
    
                    const ticker = card.dataset.ticker
                    const type = card.dataset.type
    
                    window.location.href = `#/details?type=${type}&ticker=${ticker}`
                })
            })
    
            container.querySelectorAll(".watch-btn").forEach(btn => {
                btn.addEventListener("click", async (e) => {
                    e.stopPropagation()
    
                    const card = btn.closest(".card")
                    const ticker = card.dataset.ticker
                    const isFollowed = card.dataset.followed === "true"
    
                    try {
                        if (isFollowed) {
                            await http.delete("/users/me/follows", { ticker })
                            card.remove()
                            return
    
                        } else {
                            await http.post("/users/me/follows", { ticker })
                            btn.textContent = "⭐ Unfollow"
                            card.dataset.followed = "true"
                        }
    
                    } catch (err) {
                        console.error(err)
                    }
                })
            })
           
            const form = document.getElementById("analyst-update-form")
            // pre-remplissage formulaire
            document.getElementById("analyst-name").value = user.name
            document.getElementById("analyst-email").value = user.email
            document.getElementById("analyst-company").value = user.company
            document.getElementById("analyst-bio").value = user.bio
            
            form.addEventListener("submit", async function (e) {
                e.preventDefault()
            
                const data = new FormData(form)
    
                const payload = {
                    name: data.get("name") || user.name,
                    email: data.get("email") || user.email,
                    company: data.get("company") || user.company,
                    bio: data.get("bio") || user.bio,
                }
    
                const password = data.get("password")
    
                if (data.get("password") && data.get("password").trim() !== "") {
                    payload.password = data.get("password")
                }
        
                try {
                    const result = await http.put("/users/me", payload)
        
                    console.log("UPDATE OK:", result.token)
        
                    if (result.token) {
                        localStorage.setItem("token", result.token)
                        window.location.hash = "/"
                        window.dispatchEvent(new Event("hashchange"))
                    }
        
                } catch (error) {
                    console.error("Register failed:", error)
                }
            })
    } catch (error) {
        console.error(error.message)
    }
}

export default analystPage