import http from "../../config/instanceHttp.js"
import { decodeToken } from "../../middlewares/roleGuard.js";
import stockCard from "../../components/home/cards/stockCards.js"

const userPage = `
    <main>
        <h1>USER PAGE</h1>

        <div  id="user_name"></div>
        <div id="user_id"></div>
        <div id="user_email"></div>

        <h2>My Watchlist</h2>
        <div id="watchlist"></div>
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

        const [userRes, watchRes] = await Promise.all([
            http.get(`/users/${payload.id}`),
            http.get(`/users/me/watchlist`)
        ])

        const user = userRes.result
        const watchlist = watchRes.result
        
        document.getElementById("root").innerHTML = userPage

        document.getElementById("user_id").innerHTML = "User ID: " + user.id
        document.getElementById("user_name").innerHTML = "User Name: " + user.name
        document.getElementById("user_email").innerHTML = "Email: " + user.email

        const container = document.getElementById("watchlist")

        if (!watchlist.length) {
            container.innerHTML = "<p>No favorites yet</p>"
            return
        }

        container.innerHTML = watchlist.map(asset => 
            stockCard({
                id: asset.id,
                ticker: asset.ticker,
                name: asset.name,
                isFollowed: true
            })
        ).join("")

        container.querySelectorAll(".watch-btn").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const card = e.target.closest(".card")
                const assetId = card.dataset.id

                const isFollowed = e.target.textContent.includes("unfollow")

                if (isFolowed) {
                    await http.delete(`/users/me/follows/${assetId}`)
                    e.target.textContent = "☆ Follow"
                } else {
                    await http.post(`/users/me/follows/${assetId}`)
                    e.target.textContent = "⭐ Unfollow"
                }
            })
        })

    } catch (error) {
        console.error(error.message)
    }
}

export default userPage



