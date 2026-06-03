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

        const [userRes, watchRes, stocks, forex, commodities] =
            await Promise.all([
                http.get("/users/me"),
                http.get("/users/me/watchlist"),
                getStock(),
                getForex(),
                getCommodities()
            ])

        const user = userRes.result

        renderAnalyst(user)

        const allAssets = [...stocks, ...forex, ...commodities]

        const watchlist = buildWatchlist(watchRes.result, allAssets)

        renderWatchlist(watchlist)

        bindEvents()
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

// RENDER 
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
                    await http.delete("/users/me/follows", { ticker })
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