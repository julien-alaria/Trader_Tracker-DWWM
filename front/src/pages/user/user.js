import http from "../../config/instanceHttp.js"
import { decodeToken } from "../../middlewares/roleGuard.js"
import stockCard from "../../components/cards/stockCards.js"
import { getStock, getForex, getCommodities } from "../../utils/assetsUtils.js"
import updateForm from "../../components/user/userUpdateForm.js"
import { enableCarouselWindow } from "../../utils/lazyloading.js"
import { createPaginator } from "../../utils/pagination.js"

const userPage = `
    <main>
        <h1>User Page</h1>

        <section>
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
            <div class="update-form">
                ${updateForm()}
            </div>
        </section>
    </main>
`

export default userPage

const watchlistPaginator = createPaginator({
    endpoint: "/users/me/watchlist-paginated",
    limit: 5,
    render: renderWatchlistList,
    mapResponse: (res) => ({
        results: res.results,
        hasNext: res.hasNext
    })
})

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
        renderUserInfo(user)

        const allAssets = [...stocks, ...forex, ...commodities]
        renderWatchlist(buildWatchlist(watchRes.result, allAssets))

        await watchlistPaginator.load()

        watchlistPaginator.bind({
            nextBtn: document.getElementById("watchlist-next-btn"),
            prevBtn: document.getElementById("watchlist-prev-btn")
        })

        bindEvents(watchlist)
        bindNavigation()
        initUpdateForm(user)

    } catch (err) {
        console.error("USER INIT ERROR:", err)
    }
}

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

// Watchlist Builder
function buildWatchlist(raw, assets) {
    return raw.map(w => {
        const asset = assets.find(a => a.ticker === w.ticker)
        return { ...w, ...asset, isFollowed: true }
    })
}

// Watchlist BY LIST
function renderWatchlistList(watchlist) {
    const container = document.getElementById("watchlist-list-container")
    container.innerHTML = watchlist.map(item => `
        <div class="watchlist-item" data-ticker="${item.ticker}" data-type="${item.asset_type_id}">
            <span><strong>${item.ticker}</strong></span>
            <span>${item.name}</span>
        </div>
    `).join("")

    container.querySelectorAll('.watchlist-item').forEach(el => {
        el.style.cursor = 'pointer';
        el.onclick = () => {
            const { ticker, type } = el.dataset;
            window.location.hash = `#/details?type=${type}&ticker=${ticker}`;
        }
    });
}

function renderUserInfo(user) {
    const idEl = document.getElementById("user_id")
    const nameEl = document.getElementById("user_name")
    const emailEl = document.getElementById("user_email")

    if (idEl) idEl.textContent = `User ID: ${user.id}`
    if (nameEl) nameEl.textContent = `User Name: ${user.name}`
    if (emailEl) emailEl.textContent = `Email: ${user.email}`
}

function bindEvents(watchlist) {
    let container = document.getElementById("watchlist")
    if (!container) return

    container.addEventListener("click", async (e) => {
        if (!e.target.classList.contains("watch-btn")) return
        e.stopPropagation()

        const card = e.target.closest(".card")
        if (!card) return

        const ticker = card.dataset.ticker
        try {
            await http.delete(`/me/follows/${ticker}`)
            
            const index = watchlist.findIndex(a => a.ticker === ticker)
            if (index !== -1) {
                watchlist.splice(index, 1) 
                
                // The traces of the carousel are destroyed.
                delete container.dataset.bound 
                container.innerHTML = "" 
                
                // SECURITY: If the list becomes empty, a clean node is recreated without event listeners.
                if (watchlist.length === 0) {
                    const clone = container.cloneNode(true)
                    container.parentNode.replaceChild(clone, container)
                    clone.innerHTML = "<p>No favorites yet</p>"
                    return
                }
                
                renderWatchlist(watchlist) 
            }
        } catch (err) {
            console.error("WATCH ERROR:", err)
        }
    })
}

function bindNavigation() {
    const watchlistContainer = document.getElementById("watchlist")
    if (watchlistContainer) {
        watchlistContainer.addEventListener("click", (e) => {
           
            if (e.target.classList.contains("watch-btn")) return

            const card = e.target.closest(".card")
            if (card) {
                const { ticker, type } = card.dataset
                window.location.hash = `#/details?type=${type}&ticker=${ticker}`
            }
        })
    }
}

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
        const payload = { name: data.get("name"), email: data.get("email") }

        const password = data.get("password")
        if (password?.trim()) payload.password = password

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