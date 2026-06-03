import http from "../../config/instanceHttp.js"
import { decodeToken } from "../../middlewares/roleGuard.js"
import stockCard from "../../components/cards/stockCards.js"
import { getStock, getForex, getCommodities } from "../../utils/assetsUtils.js"
import { loadTradingViewChart } from "../../utils/tradingChart.js"
import updateForm from "../../components/user/userUpdateForm.js"

const userPage = `
<main>
    <h1>User Page</h1>

    <section>
        <div id="user_id"></div>
        <div id="user_name"></div>
        <div id="user_email"></div>
    </section>

    <h2>My Watchlist</h2>
    <div id="watchlist"></div>

    <div class="update-form">
        ${updateForm()}
    </div>
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

        const [userRes, watchRes, stocks, forex, commodities] =
            await Promise.all([
                http.get("/users/me"),
                http.get("/users/me/watchlist"),
                getStock(),
                getForex(),
                getCommodities()
            ])

        const user = userRes.result
        const watchlistRaw = watchRes.result

        renderUserInfo(user)

        const allAssets = [...stocks, ...forex, ...commodities]

        const watchlist = buildWatchlist(watchlistRaw, allAssets)

        renderWatchlist(watchlist)

        bindCardNavigation()
        bindWatchButtons()
        initUpdateForm(user)

    } catch (err) {
        console.error("USER INIT ERROR:", err)
    }
}

// UI RENDER
function renderUserInfo(user) {
    const idEl = document.getElementById("user_id")
    const nameEl = document.getElementById("user_name")
    const emailEl = document.getElementById("user_email")

    if (idEl) idEl.textContent = `User ID: ${user.id}`
    if (nameEl) nameEl.textContent = `User Name: ${user.name}`
    if (emailEl) emailEl.textContent = `Email: ${user.email}`
}

function buildWatchlist(watchlistRaw, allAssets) {
    return watchlistRaw.map(w => {
        const asset = allAssets.find(a => a.ticker === w.ticker)

        return {
            ...w,
            ...asset,
            isFollowed: true
        }
    })
}

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

    // charts uniquement ici (page user)
    watchlist.forEach(asset => {
        loadTradingViewChart(asset.ticker)
    })
}

// EVENTS
function bindCardNavigation() {
    document.querySelectorAll(".card").forEach(card => {
        card.addEventListener("click", () => {
            const { ticker, type } = card.dataset
            window.location.hash = `#/details?type=${type}&ticker=${ticker}`
        })
    })
}

function bindWatchButtons() {
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
function initUpdateForm(user) {
    const form = document.getElementById("user-update-form")
    if (!form) return

    const nameInput = document.getElementById("user-name")
    const emailInput = document.getElementById("user-email")

    if (nameInput) nameInput.value = user.name
    if (emailInput) emailInput.value = user.email

    form.addEventListener("submit", async (e) => {
        e.preventDefault()

        const data = new FormData(form)

        const payload = {
            name: data.get("name"),
            email: data.get("email")
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

export default userPage