import http from "../../config/instanceHttp.js"
import { decodeToken } from "../../middlewares/roleGuard.js"
import stockCard from "../../components/cards/stockCards.js"
import { getStock, getForex, getCommodities } from "../../utils/assetsUtils.js"
import { loadTradingViewChart } from "../../utils/tradingChart.js"
import analystUpdateForm from "../../components/user/analystUpdateForm.js"

const analystPage = `
<main>
    <h1>Analyst Page</h1>

    <section>
        <div id="analyst_id"></div>
        <div id="analyst_name"></div>
        <div id="analyst_email"></div>
        <div id="analyst_type"></div>
        <div id="analyst_company"></div>
        <div id="analyst_bio"></div>
    </section>

    <h2>Watchlist</h2>
    <div id="watchlist"></div>

    <h2>My Recommendations</h2>
    <div id="my-recommendations"></div>

    <div class="update-form">
        ${analystUpdateForm()}
    </div>
</main>
`

export async function initAnalyst() {
    try {
        const token = localStorage.getItem("token")
        if (!token) return

        const payload = decodeToken(token)
        if (!payload) {
            window.location.hash = "/login"
            return
        }

        const [userRes, watchRes, recommendationsRes, stocks, forex, commodities] =
            await Promise.all([
                http.get("/users/me"),
                http.get("/users/me/watchlist"),
                http.get("/recommendations/me"),
                getStock(),
                getForex(),
                getCommodities()
            ])

        const user = userRes.result

        renderAnalyst(user)

        const allAssets = [...stocks, ...forex, ...commodities]

        const watchlist = buildWatchlist(watchRes.result, allAssets)

        renderWatchlist(watchlist)
        renderRecommendations(recommendationsRes.results || [], user)

        bindEvents()
        bindRecommendationEvents(user)
        initForm(user)

    } catch (err) {
        console.error("ANALYST INIT ERROR:", err)
    }
}

// UI 
function renderAnalyst(user) {
    const map = {
        analyst_id: user.id,
        analyst_name: user.name,
        analyst_email: user.email,
        analyst_type: user.analyst_type_id,
        analyst_company: user.company,
        analyst_bio: user.bio
    }

    Object.entries(map).forEach(([id, value]) => {
        const el = document.getElementById(id)
        if (el) el.textContent = value ?? "N/A"
    })
}

// DATA 
function buildWatchlist(raw, assets) {
    return raw.map(w => {
        const asset = assets.find(a => a.ticker === w.ticker)

        return {
            ...w,
            ...asset,
            isFollowed: true
        }
    })
}

// RENDER WATCHLIST
function renderWatchlist(watchlist) {
    const container = document.getElementById("watchlist")
    if (!container) return

    if (!watchlist.length) {
        container.innerHTML = "<p>No favorites yet</p>"
        return
    }

    container.innerHTML = watchlist
        .map(asset => stockCard(asset))
        .join("")

    watchlist.forEach(asset => {
        loadTradingViewChart(asset.ticker)
    })
}

// RENDER RECOMMENDATIONS
function renderRecommendations(recommendations, user) {
    const container = document.getElementById("my-recommendations")
    if (!container) return

    if (!recommendations.length) {
        container.innerHTML = "<p>No recommendations yet</p>"
        return
    }

    container.innerHTML = recommendations.map(rec => {

        const isAuthorized = user && (user.role === "admin" || Number(user.id) === Number(rec.user_id))

        return `
        <div class="recommendation" data-id="${rec.id}">
            <strong>${rec.status}</strong>
            <p>${rec.comment}</p>
            <p>Asset: ${rec.name} (${rec.ticker})</p>

            <small>${new Date(rec.created_at).toLocaleDateString()}</small>

            ${isAuthorized ? `
                <button class="delete-btn" data-id="${rec.id}">DELETE</button>

                <form class="edit-form hidden" data-id="${rec.id}">
                    <select name="status">
                        <option value="BUY">BUY</option>
                        <option value="SELL">SELL</option>
                        <option value="HOLD">HOLD</option>
                    </select>

                    <input name="comment" placeholder="comment" />

                    <button type="submit">EDIT</button>
                </form>
            ` : ""}
        </div>
        `
    }).join("")
}

function bindRecommendationEvents(user) {
    const container = document.getElementById("my-recommendations")
    if (!container) return

    // DELETE
    container.addEventListener("click", async (e) => {

        if (e.target.classList.contains("delete-btn")) {
            const id = e.target.dataset.id
            const card = e.target.closest(".recommendation")

            try {
                await http.delete(`/recommendations/${id}`)
                card.remove()
            } catch (err) {
                console.error("DELETE ERROR:", err)
            }
        }
    })

    // UPDATE
    container.addEventListener("submit", async (e) => {
        if (!e.target.classList.contains("edit-form")) return

        e.preventDefault()

        const id = e.target.dataset.id
        const data = new FormData(e.target)

        try {
            await http.put(`/recommendations/${id}`, {
                status: data.get("status"),
                comment: data.get("comment")
            })

            // refresh
            const updated = await http.get("/recommendations/me")
            renderRecommendations(updated.results || [], user)

        } catch (err) {
            console.error("UPDATE ERROR:", err)
        }
    })
}

// EVENTS
function bindEvents() {
    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", () => {
            const { ticker, type } = card.dataset
            window.location.hash = `#/details?type=${type}&ticker=${ticker}`
        })
    })

    document.querySelectorAll(".watch-btn").forEach(btn => {
        btn.addEventListener("click", async (e) => {
            e.stopPropagation()

            const card = btn.closest(".card")
            if (!card) return

            const ticker = card.dataset.ticker
            const isFollowed = card.dataset.followed === "true"

            try {
                if (isFollowed) {
                    await http.delete(`/users/me/follows/${ticker}`)
                    card.remove()
                } else {
                    await http.post("/users/me/follows", { ticker })
                    btn.textContent = "⭐ Unfollow"
                    card.dataset.followed = "true"
                }
            } catch (err) {
                console.error("WATCH ERROR:", err)
            }
        })
    })
}

// FORM 
function initForm(user) {
    const form = document.getElementById("analyst-update-form")
    if (!form) return

    const fields = {
        "analyst-name": user.name,
        "analyst-email": user.email,
        "analyst-company": user.company,
        "analyst-bio": user.bio
    }

    Object.entries(fields).forEach(([id, value]) => {
        const el = document.getElementById(id)
        if (el) el.value = value ?? ""
    })

    form.addEventListener("submit", async (e) => {
        e.preventDefault()

        const data = new FormData(form)

        const payload = {
            name: data.get("name"),
            email: data.get("email"),
            company: data.get("company"),
            bio: data.get("bio")
        }

        const password = data.get("password")
        if (password?.trim()) {
            payload.password = password
        }

        try {
            const result = await http.put("/users/me", payload)

            if (result.token) {
                localStorage.setItem("token", result.token)
                window.location.hash = "/"
                window.dispatchEvent(new Event("hashchange"))
            }
        } catch (err) {
            console.error("UPDATE ERROR:", err)
        }
    })
}

export default analystPage