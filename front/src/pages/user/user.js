import http from "../../config/instanceHttp.js"
import { decodeToken } from "../../middlewares/roleGuard.js"
import stockCard from "../../components/home/cards/stockCards.js"
import { getStock, getForex, getCommodities } from "../utils/assetsUtils.js"

const userPage = `
    <main>
        <h1>USER PAGE</h1>

        <div id="user_name"></div>
        <div id="user_id"></div>
        <div id="user_email"></div>

        <h2>My Watchlist</h2>
        <div id="watchlist"></div>
    </main>
`

export async function initUser() {
    try {
        const token = localStorage.getItem("token")
        const payload = decodeToken(token)

        if (!payload) {
            window.location.hash = "/login"
            return
        }

        document.getElementById("root").innerHTML = userPage

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
                id: asset.id,
                ticker: asset.ticker,
                name: asset.name,
                price: asset.price,
                isFollowed: true
            })
        ).join("")

        container.querySelectorAll(".watch-btn").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                e.stopPropagation()

                const card = e.target.closest(".card")
                const ticker = card.dataset.ticker

                const isFollowed = card.dataset.followed === "true"

                try {
                    if (isFollowed) {
                        await http.delete("/users/me/follows", { ticker })
                        e.target.textContent = "☆ Follow"
                        card.dataset.followed = "false"
                    } else {
                        await http.post("/users/me/follows", { ticker })
                        e.target.textContent = "⭐ Unfollow"
                        card.dataset.followed = "true"
                    }

                } catch (err) {
                    console.error(err)
                }
            })
        })
    } catch (error) {
        console.error(error.message)
    }
}

export default userPage



