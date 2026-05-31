import http from "../../config/instanceHttp.js"
import { decodeToken } from "../../middlewares/roleGuard.js"
import stockCard from "../../components/home/cards/stockCards.js"
import { getStock, getForex, getCommodities } from "../utils/assetsUtils.js"
import { loadTradingViewChart } from "../../utils/tradingChart.js"
import updateForm from "../../components/user/userUpdateForm.js"

const userPage = `
    <main>
        <h1>USER PAGE</h1>

        <div id="user_name"></div>
        <div id="user_id"></div>
        <div id="user_email"></div>

        <h2>My Watchlist</h2>
        <div id="watchlist"></div>
        <div class="update-form">${updateForm()}</div>
    </main>
`

export async function initUser() {
    try {
        const token = localStorage.getItem("token")

        if (!token) return

        const payload = decodeToken(token)

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

        document.getElementById("user_id").textContent = `User ID: ${user.id}`
        document.getElementById("user_name").textContent = `User Name: ${user.name}`
        document.getElementById("user_email").textContent = `Email: ${user.email}`

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
        
        const form = document.getElementById("user-update-form")
        // pre-remplissage formulaire
        document.getElementById("user-name").value = user.name
        document.getElementById("user-email").value = user.email
        
        form.addEventListener("submit", async function (e) {
            e.preventDefault()
        
            const data = new FormData(form)

            const payload = {
                name: data.get("name"),
                email: data.get("email"),
            }

            const password = data.get("password")

            if (password && password.trim() !== "") {
                payload.password = password
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

export default userPage



