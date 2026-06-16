import { API_BASE_URL } from "../../config/api.js"
import http from "../../config/instanceHttp.js"
import { decodeToken } from "../../middlewares/roleGuard.js"
import stockCard from "../../components/cards/stockCards.js"
import analystCard from "../../components/cards/analystCard.js"
import { getStock, getForex, getCommodities } from "../../utils/assetsUtils.js"
import updateForm from "../../components/forms/userUpdateForm.js"
import { enableCarouselWindow } from "../../utils/lazyloading.js"
import { createPaginator } from "../../utils/pagination.js"

// =====================
// TEMPLATE
// =====================
const userPage = `
<main>
    <h1>User Page</h1>

    <section>
        <div><img id="user_picture" src="" /></div>
        <div id="user_id"></div>
        <div id="user_name"></div>
        <div id="user_email"></div>
    </section>

    <section>
        <h2>My Watchlist</h2>
        <div class="carousel" id="watchlist"></div>

        <h2>Watchlist By List</h2>
        <div id="watchlist-list-container"></div>
        <div id="watchlist-pagination">
            <button id="watchlist-prev-btn">Previous</button>
            <button id="watchlist-next-btn">Next</button>
        </div>
    </section>

    <section>
        <h2>Followed Analysts</h2>
        <div class="carousel" id="follow"></div>

        <h2>Followed Analysts By List</h2>
        <div id="follow-list-container"></div>

        <div id="follow-pagination">
            <button id="follow-prev-btn">Previous</button>
            <button id="follow-next-btn">Next</button>
        </div>
    </section>

    <section>
        <div class="update-form">
            ${updateForm()}
        </div>
    </section>
</main>
`

export default userPage

// =====================
// STATE GLOBAL
// =====================
let followState = []

// =====================
// PAGINATORS
// =====================
const watchlistPaginator = createPaginator({
    endpoint: "/users/me/watchlist-paginated",
    limit: 5,
    render: renderWatchlistList,
    mapResponse: (res) => ({
        results: res.results,
        hasNext: res.hasNext
    })
})

const followPaginator = createPaginator({
    endpoint: "/users/me/follows/users",
    limit: 5,
    render: renderFollowList,
    mapResponse: (res) => ({
        results: res.results,
        hasNext: res.hasNext
        // Nettoyé de la clé offset forcée pour éviter les conflits d'état interne
    })
})

// =====================
// INIT
// =====================
export async function initUser() {
    try {
        const token = localStorage.getItem("token")
        if (!token) return

        const payload = decodeToken(token)
        if (!payload) {
            window.location.hash = "/login"
            return
        }

        // Asynchronous security to allow time for the DOM to be injected by the router
        await new Promise(resolve => setTimeout(resolve, 0))

        const [userRes, watchRes, followRes, stocks, forex, commodities] =
            await Promise.all([
                http.get("/users/me"),
                http.get("/users/me/watchlist"),
                http.get("/users/me/follows/users"),
                getStock(),
                getForex(),
                getCommodities()
            ])

        const user = userRes.result
        renderUserInfo(user)

        const allAssets = [...stocks, ...forex, ...commodities]
        const watchlist = buildWatchlist(watchRes.result, allAssets)

        followState = followRes.results || []

        renderWatchlist(watchlist)
        renderFollowCarousel()

        // Initial loading of paginators
        await watchlistPaginator.load()
        await followPaginator.load()

        // Event bindings for pagination buttons
        watchlistPaginator.bind({
            nextBtn: document.getElementById("watchlist-next-btn"),
            prevBtn: document.getElementById("watchlist-prev-btn")
        })

        followPaginator.bind({
            nextBtn: document.getElementById("follow-next-btn"),
            prevBtn: document.getElementById("follow-prev-btn")
        })

        bindEvents(watchlist)
        bindNavigation()
        initUpdateForm(user)

    } catch (err) {
        console.error("USER INIT ERROR:", err)
    }
}

// =====================
// CAROUSEL (FOLLOW)
// =====================
function renderFollowCarousel() {
    const container = document.getElementById("follow")
    if (!container) return

    if (!followState.length) {
        container.innerHTML = "<p>No analysts followed</p>"
        return
    }

    enableCarouselWindow({
        selector: "#follow",
        batchSize: 5,
        getData: () => followState,
        cardComponent: analystCard
    })

    // Click listener via addEventListener (instead of the .onclick property to avoid overwriting)
    container.addEventListener("click", (e) => {
        const card = e.target.closest(".analyst")
        if (!card) return
        window.location.hash = `#/analystdetails?id=${card.dataset.id}`
    })
}

// =====================
// FOLLOWED ANALYSTS BY LIST
// =====================
function renderFollowList(users, payload, meta) {
    const container = document.getElementById("follow-list-container")
    const paginationDiv = document.getElementById("follow-pagination")

    if (!container || !paginationDiv) return

    // Added cursor pointer style
    container.innerHTML = users.map(a => {
        const defaultAvatar = "/assets/default_analyst.png"
        const imageUrl = a.picture ? `${API_BASE_URL}/uploads/${a.picture}` : defaultAvatar

        return `
            <div class="follow-item" data-id="${a.id}" style="cursor: pointer; display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
                <img src="${imageUrl}" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover;" alt="analyst-picture" />
                <p><strong>${a.name}</strong> - ${a.company ?? "Unknown"}</p>
            </div>
        `
    }).join("")

    // Proper management of button visibility
    paginationDiv.style.display = (meta?.hasNext || (meta?.offset && meta.offset > 0)) ? "flex" : "none"

    // Delegating your own event to the container
    container.onclick = (e) => {
        const item = e.target.closest(".follow-item")
        if (!item) return
        window.location.hash = `#/analystdetails?id=${item.dataset.id}`
    }
}

// =====================
// WATCHLIST CAROUSEL
// =====================
function renderWatchlist(watchlist) {
    const container = document.getElementById("watchlist")
    if (!container) return

    if (!watchlist.length) {
        container.innerHTML = "<p>No favorites yet</p>"
        return
    }

    enableCarouselWindow({
        selector: "#watchlist",
        batchSize: 5,
        getData: () => watchlist,
        cardComponent: stockCard
    })
}

// =====================
// WATCHLIST BY LIST
// =====================
function renderWatchlistList(watchlist) {
    const container = document.getElementById("watchlist-list-container")
    if (!container) return

    // Added data-type, data-ticker, and cursor pointer style
    container.innerHTML = watchlist.map(item => `
        <div class="watchlist-item" data-ticker="${item.ticker}" data-type="${item.asset_type_id}" style="cursor: pointer;">
            <strong>${item.ticker}</strong> - ${item.name}
        </div>
    `).join("")

    // Single event delegation for list redirection
    container.onclick = (e) => {
        const item = e.target.closest(".watchlist-item")
        if (!item) return

        const { ticker, type } = item.dataset
        if (ticker) {
            window.location.hash = `#/details?type=${type}&ticker=${ticker}`
        }
    }
}

// =====================
// USER INFO
// =====================
function renderUserInfo(user) {
    const idEl = document.getElementById("user_id")
    const nameEl = document.getElementById("user_name")
    const emailEl = document.getElementById("user_email")
    const imageEl = document.getElementById("user_picture")

    if (idEl) idEl.textContent = `User ID: ${user.id}`
    if (nameEl) nameEl.textContent = `User: ${user.name}`
    if (emailEl) emailEl.textContent = `Email: ${user.email}`
   if (imageEl) {
        const defaultAvatar = "/assets/default_analyst.png"
        
        imageEl.src = user.picture ? `${API_BASE_URL}/uploads/${user.picture}` : defaultAvatar
        imageEl.alt = `Avatar de ${user.name || 'l\'utilisateur'}`
    }
}

// =====================
// WATCH EVENTS (CAROUSEL)
// =====================
function bindEvents(watchlist) {
    const container = document.getElementById("watchlist")
    if (!container) return

    container.addEventListener("click", async (e) => {
        const btn = e.target.closest(".watch-btn")
        if (!btn) return

        const card = btn.closest(".stock-card") || btn.closest(".card")
        if (!card) return

        const ticker = card.dataset.ticker

        try {
            await http.delete(`/me/follows/${ticker}`)

            const index = watchlist.findIndex(a => a.ticker === ticker)
            if (index !== -1) {
                watchlist.splice(index, 1)
                renderWatchlist(watchlist)
                // Force le rafraîchissement synchrone de la liste paginée pour rester raccord
                await watchlistPaginator.load()
            }
        } catch (err) {
            console.error("UNFOLLOW ASSET ERROR:", err)
        }
    })
}

function bindNavigation() {
    const container = document.getElementById("watchlist")
    if (!container) return

    container.addEventListener("click", (e) => {
        // Bloque la redirection si le clic vient de l'action de suppression
        if (e.target.closest(".watch-btn")) return

        const card = e.target.closest(".stock-card") || e.target.closest(".card")
        if (!card) return

        const { ticker, type } = card.dataset
        window.location.hash = `#/details?type=${type}&ticker=${ticker}`
    })
}

// =====================
// HELPERS & FORM
// =====================
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

// =====================
// FORM
// =====================
function initUpdateForm(user) {
    const form = document.getElementById("user-update-form")
    if (!form) return

    const fields = {
        "user-name": user.name,
        "user-email": user.email
    }

    Object.entries(fields).forEach(([id, value]) => {
        const el = document.getElementById(id)
        if (el) el.value = value ?? ""
    })

    form.addEventListener("submit", async (e) => {
        e.preventDefault()
        
        const data = new FormData(form)

        const passwordInput = data.get("password")
        if (!passwordInput || !passwordInput.trim()) {
            data.delete("password")
        }

        try {
            const result = await http.put("/users/me", data)

            if (result && result.token) {
                localStorage.setItem("token", result.token)
            }

            window.location.reload()
        } catch (err) {
            console.error("UPDATE ERROR:", err)
        }
    })
}