import http from "../../config/instanceHttp.js"
import { decodeToken } from "../../middlewares/roleGuard.js"
import stockCard from "../../components/cards/stockCards.js"
import { getStock, getForex, getCommodities } from "../../utils/assetsUtils.js"
import analystUpdateForm from "../../components/user/analystUpdateForm.js"
import { enableCarouselWindow } from "../../utils/lazyloading.js"
import { createPaginator } from "../../utils/pagination.js"

const adminPage = `
<main>
    <h1>ADMIN PAGE</h1>

    <section>
        <div id="admin_name"></div>
        <div id="admin_id"></div>
        <div id="admin_email"></div>
    </section>

    <section>
        <h2>Watchlist</h2>
        <div class="carousel" id="watchlist"></div>

        <h2>By List</h2>
        <div id="watchlist-list-container"></div>
        
        <div id="watchlist-pagination">
            <button id="watchlist-prev-btn">Previous</button>
            <button id="watchlist-next-btn">Next</button>
        </div>
    </section>

    <section>
        <h2>All Recommendations</h2>
        <div id="all-recommendations"></div>

        <div id="pagination">
            <button id="prev-btn">Previous</button>
            <button id="next-btn">Next</button>
        </div>
    </section>

    <section>
        <h2 id="admin-users-title">Gestion des Utilisateurs</h2>

        <div id="users-list"></div>

        <div id="users-pagination">
            <button id="users-prev-btn">Previous</button>
            <button id="users-next-btn">Next</button>
        </div>
    </section>

    <section class="update-form">
        ${analystUpdateForm()}
    </section>
</main>
`

export default adminPage

// PAGINATORS
const recommendationsPaginator = createPaginator({
    endpoint: "/recommendations",
    limit: 3,
    render: renderRecommendations,
    getPayload: () => decodeToken(localStorage.getItem("token")),
    mapResponse: (res) => res
})

const usersPaginator = createPaginator({
    endpoint: "/users",
    limit: 3,
    render: renderUserList,
    getPayload: () => decodeToken(localStorage.getItem("token")),
    mapResponse: (res) => res
})

const watchlistPaginator = createPaginator({
    endpoint: "/users/me/watchlist-paginated", // Assurez-vous que votre route pointe vers getWatchlistPagin
    limit: 5,
    render: renderWatchlistList,
    mapResponse: (res) => ({
        results: res.results, // Correction ici : c'est 'results' (avec un s) que vous renvoyez dans le controller
        hasNext: res.hasNext
    })
})

// INIT
export async function initAdmin() {
    try {
        const token = localStorage.getItem("token")
        if (!token) return

        const payload = decodeToken(token)
        if (!payload) {
            window.location.hash = "/login"
            return
        }

        const [
            userRes,
            watchRes,
            stocks,
            forex,
            commodities
        ] = await Promise.all([
            http.get("/users/me"),
            http.get("/users/me/watchlist"),
            getStock(),
            getForex(),
            getCommodities()
        ])

        const user = userRes.result
       

        renderAdmin(user)

        const allAssets = [...stocks, ...forex, ...commodities]
        renderWatchlist(buildWatchlist(watchRes.result, allAssets))
        const fullWatchlist = buildWatchlist(watchRes.result, allAssets)

        await usersPaginator.load()
        await recommendationsPaginator.load()
        await watchlistPaginator.load()

        usersPaginator.bind({
            nextBtn: document.getElementById("users-next-btn"),
            prevBtn: document.getElementById("users-prev-btn")
        })

        recommendationsPaginator.bind({
            nextBtn: document.getElementById("next-btn"),
            prevBtn: document.getElementById("prev-btn")
        })

       watchlistPaginator.bind({
            nextBtn: document.getElementById("watchlist-next-btn"),
            prevBtn: document.getElementById("watchlist-prev-btn")
        })

        bindRecommendationEvents(payload)
        bindNavigation()
        initForm(user)

    } catch (err) {
        console.error("ADMIN INIT ERROR:", err)
    }
}

// RENDER ADMIN INFO
function renderAdmin(user) {
    const map = {
        admin_id: user.id,
        admin_name: user.name,
        admin_email: user.email
    }

    Object.entries(map).forEach(([id, value]) => {
        const el = document.getElementById(id)
        if (el) el.textContent = value ?? "N/A"
    })
}

// WATCHLIST
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

// USERS
function renderUserList(users) {
    const container = document.getElementById("users-list")

    container.innerHTML = users.map(user => `
        <div class="user-item">
            <span>${user.name} (${user.role})</span>
            <button onclick="editUser('${user.id}')">Éditer</button>
            <button onclick="deleteUser('${user.id}')">Supprimer</button>
        </div>
    `).join("")
}

// RECOMMENDATIONS
function renderRecommendations(recommendations, user) {
    const container = document.getElementById("all-recommendations")

    container.innerHTML = recommendations.map(rec => {
        const isMine = Number(user.id) === Number(rec.user_id)

        return `
        <div class="recommendation" data-id="${rec.id}">
            <strong>${rec.status}</strong>
            <p>${rec.comment}</p>

            <div class="meta">
                <span>Analyst: <strong>${rec.analyst_name}</strong></span>
                ${isMine ? '<span class="badge">Me</span>' : ''}
            </div>

            <p>Asset: ${rec.name} (${rec.ticker})</p>

            <button class="delete-btn" data-id="${rec.id}">
                DELETE
            </button>

            <form class="edit-form hidden" data-id="${rec.id}">
                <select name="status">
                    <option value="BUY" ${rec.status === "BUY" ? "selected" : ""}>BUY</option>
                    <option value="SELL" ${rec.status === "SELL" ? "selected" : ""}>SELL</option>
                    <option value="HOLD" ${rec.status === "HOLD" ? "selected" : ""}>HOLD</option>
                </select>

                <input name="comment" value="${rec.comment}" required />

                <button type="submit">EDIT</button>
            </form>
        </div>
        `
    }).join("")
}

// EVENTS
function bindRecommendationEvents(user) {
    const container = document.getElementById("all-recommendations")
    if (!container) return

    container.addEventListener("click", async (e) => {
        if (!e.target.classList.contains("delete-btn")) return

        try {
            await http.delete(`/recommendations/${e.target.dataset.id}`)
            await recommendationsPaginator.load()
        } catch (err) {
            console.error("DELETE ERROR:", err)
        }
    })

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

            await recommendationsPaginator.load()

        } catch (err) {
            console.error("UPDATE ERROR:", err)
        }
    })
}

// WATCHLIST NAVIGATION
function bindNavigation() {
    const watchlistContainer = document.getElementById("watchlist")

    if (!watchlistContainer) return

    watchlistContainer.addEventListener("click", (e) => {
        const card = e.target.closest(".card")
        if (!card) return

        const { ticker, type } = card.dataset
        window.location.hash = `#/details?type=${type}&ticker=${ticker}`
    })
}

// FORM
function initForm(user) {
    const form = document.getElementById("analyst-update-form")
    if (!form) return

    form.addEventListener("submit", async (e) => {
        e.preventDefault()

        const data = new FormData(form)
        const targetId = data.get("target_user_id")

        const payload = {
            name: data.get("name"),
            email: data.get("email"),
            company: data.get("company"),
            bio: data.get("bio")
        }

        const url = targetId ? `/users/${targetId}` : "/users/me"

        try {
            await http.put(url, payload)
            alert("Profil mis à jour !")
            initAdmin()
        } catch (err) {
            console.error("UPDATE ERROR:", err)
        }
    })
}

// GLOBAL USER ACTIONS
window.editUser = async (id) => {
    try {
        const res = await http.get(`/users/${id}`)
        const user = res.result

        document.getElementById("analyst-name").value = user.name
        document.getElementById("analyst-email").value = user.email
        document.getElementById("analyst-company").value = user.company || ""
        document.getElementById("analyst-bio").value = user.bio || ""
        document.getElementById("target-user-id").value = user.id

        document.querySelector(".update-form")
            .scrollIntoView({ behavior: "smooth" })

    } catch (err) {
        console.error("EDIT USER ERROR:", err)
    }
}

window.deleteUser = async (id) => {
    const btn = document.querySelector(`button[onclick="deleteUser('${id}')"]`)
    if (!btn) return

    btn.innerHTML = "Confirmer ?"

    btn.onclick = async () => {
        try {
            await http.delete(`/users/${id}`)
            await usersPaginator.load()
        } catch (err) {
            console.error("DELETE USER ERROR:", err)
        }
    }
}