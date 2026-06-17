import { API_BASE_URL } from "../../config/api.js"
import http from "../../config/instanceHttp.js"
import { decodeToken } from "../../middlewares/roleGuard.js"
import stockCard from "../../components/cards/stockCards.js"
import analystCard from "../../components/cards/analystCard.js"
import analystUpdateForm from "../../components/forms/analystUpdateForm.js"
import { getStock, getForex, getCommodities } from "../../utils/assetsUtils.js"
import { enableCarouselWindow } from "../../utils/lazyloading.js"
import { createPaginator } from "../../utils/pagination.js"

// =====================
// TEMPLATE
// =====================
const analystPage = `
    <main>
        <h1>Analyst Page</h1>

        <section>
            <div><img id="analyst_picture" src="" /></div>
            <div id="analyst_id"></div>
            <div id="analyst_name"></div>
            <div id="analyst_email"></div>
            <div id="analyst_type"></div>
            <div id="analyst_company"></div>
            <div id="analyst_bio"></div>
        </section>

        <section>
            <h2>Watchlist</h2>
            <div class="carousel" id="watchlist"></div>

            <div id="watchlist-list-global">
                <h2>Watchlist By List</h2>
                <div id="watchlist-list-container"></div>
            
                <div id="watchlist-pagination">
                    <button id="watchlist-prev-btn">Previous</button>
                    <button id="watchlist-next-btn">Next</button>
                </div>
            </div>
        </section>

        <section>
            <h2>My Recommendations</h2>
            <div id="my-recommendations"></div>

            <div id="pagination">
                <button id="prev-btn">Previous</button>
                <button id="next-btn">Next</button>
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
                ${analystUpdateForm()}
            </div>
        </section>
    </main>
`

export default analystPage

// =====================
// PAGINATORS
// =====================

// =====================
// RECOMMENDATIONS PAGINATORS
// =====================
const recommendationsPaginator = createPaginator({
    endpoint: "/recommendations/me",
    limit: 3,
    render: renderRecommendations,
    getPayload: () => decodeToken(localStorage.getItem("token")),
    mapResponse: (res) => res
})

// =====================
// WATCHLIST PAGINATORS
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

// =====================
// FOLLOW PAGINATORS
// =====================
const followPaginator = createPaginator({
    endpoint: "/users/me/follows/users",
    limit: 5,
    render: renderFollowList,
    mapResponse: (res) => ({
        results: res.results,
        hasNext: res.hasNext,
        offset: res.offset ?? 0
    })
})

// =====================
// INIT
// =====================
export async function initAnalyst() {
    try {
        const token = localStorage.getItem("token")
        if (!token) return

        const payload = decodeToken(token)
        if (!payload) {
            window.location.hash = "/login"
            return
        }

        // central fetch
        const [userRes, watchRes, followRes, stocks, forex, commodities] =
            await Promise.all([
                http.get("/users/me"),
                http.get("/users/me/watchlist"),
                http.get("/users/me/follows/users"),
                getStock(),
                getForex(),
                getCommodities()
            ])

        // get & display user
        const user = userRes.result
        renderAnalyst(user)

        // get & display assets
        const allAssets = [...stocks, ...forex, ...commodities]
        renderWatchlist(buildWatchlist(watchRes.result, allAssets))

        // get & display follow analysts
        const follows = followRes.results || []
        renderFollowCarousel(follows)

        // Initial loading of recommendationsPaginator
        await recommendationsPaginator.load()
        // Initial loading of watchlistPaginator
        await watchlistPaginator.load()
        // Initial loading of followPaginator
        await followPaginator.load()

        // =====================
        // BINDERS
        // =====================

        recommendationsPaginator.bind({
            nextBtn: document.getElementById("next-btn"),
            prevBtn: document.getElementById("prev-btn")
        })

        watchlistPaginator.bind({
            nextBtn: document.getElementById("watchlist-next-btn"),
            prevBtn: document.getElementById("watchlist-prev-btn")
        })

        followPaginator.bind({
            nextBtn: document.getElementById("follow-next-btn"),
            prevBtn: document.getElementById("follow-prev-btn")
        })
        
        // events on recommendations (edit & delete)
        bindRecommendationEvents(user)
        // analyst edit form
        initForm(user)
        // events on stock card
        bindNavigation() 
        
    } catch (err) {
        console.error("ANALYST INIT ERROR:", err)
    }
}

// =====================
// RENDERING ANALYST
// =====================
function renderAnalyst(user) {
    const map = {
        analyst_id: user.id,
        analyst_name: user.name,
        analyst_email: user.email,
        analyst_type: user.analyst_type_id,
        analyst_company: user.company,
        analyst_bio: user.bio,
        analyst_picture: user.picture
    }

    Object.entries(map).forEach(([id, value]) => {
        const el = document.getElementById(id)
        if (!el) return

        // CASE id === analyst_picture
        if (id === "analyst_picture") {
            if (value) {
                el.src = `${API_BASE_URL}/uploads/${value}`
            } else {
                el.src = "/assets/default_analyst.png"
            }
            el.alt = `${user.name || "analyst"}`

        } else {
            el.textContent = value ?? "N/A"
        }
    })
}

// =====================
// BUILDING WATCHLIST BY LINKING TICKERS OF USER FOLLOW & ALL ASSETS
// =====================
function buildWatchlist(raw, assets) {
    return raw.map(w => {
        const asset = assets.find(a => a.ticker === w.ticker)
        return { ...w, ...asset, isFollowed: true }
    })
}

// =====================
// RENDERING WATCHLIST CARROUSEL
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
    });
}

// =====================
// CARROUSEL FOLLOW ANALYSTS
// =====================
function renderFollowCarousel(follows) {
    const container = document.getElementById("follow")
    if (!container) return

    if (!follows.length) {
        container.innerHTML = "<p>No analysts followed</p>"
        return
    }

    enableCarouselWindow({
        selector: "#follow",
        batchSize: 5,
        getData: () => follows,
        cardComponent: analystCard
    })

    container.addEventListener("click", (e) => {
        const card = e.target.closest(".analyst")
        if (!card) return
        window.location.hash = `#/analystdetails?id=${card.dataset.id}`
    })
}

// =====================
// WATCH RECOMMENDATIONS EVENTS (DELETE & EDIT)
// =====================
function bindRecommendationEvents(user) {
    const container = document.getElementById("my-recommendations")
    if (!container) return

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
            // CORRECTIF 1 : Rechargement propre via le paginateur dédié
            await recommendationsPaginator.load()
        } catch (err) {
            console.error("UPDATE ERROR:", err)
        }
    })
}

// =====================
// FORM
// =====================
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

// =====================
// WATCH NAVIGATION EVENTS ON STOCK CARD
// =====================
function bindNavigation() {
    const watchlistContainer = document.getElementById("watchlist")
    if (watchlistContainer) {
        watchlistContainer.addEventListener("click", (e) => {
            const card = e.target.closest(".stock-card") || e.target.closest(".card")
            if (card) {
                const { ticker, type } = card.dataset
                window.location.hash = `#/details?type=${type}&ticker=${ticker}`
            }
        })
    }
}

// =====================
// PAGINATORS FUNCTIONS 
// =====================

// =====================
// RENDERING RECOMMENDATIONS
// =====================
function renderRecommendations(recommendations, user, meta) {
    const container = document.getElementById("my-recommendations")
    const paginationDiv = document.getElementById("pagination") 
    if (!container) return

    if (!recommendations || !recommendations.length) {
        container.innerHTML = "<p>No recommendations yet</p>"
        if (paginationDiv) paginationDiv.style.display = "none" 
        return 
    }

    if (paginationDiv) paginationDiv.style.display = "flex"

    container.innerHTML = recommendations.map(rec => {
         const defaultAvatar = "/assets/logo/nasdaq_logo.png"
            const imageUrl = `/assets/logos/${rec.ticker.toLowerCase()}.svg` || defaultAvatar

            let recoImage

            if (rec.status === "BUY") {
                recoImage = "/assets/arrows/up-green.svg";
            } else if (rec.status === "SELL") {
                recoImage = "/assets/arrows/down-red.svg";
            } else {
                recoImage = "/assets/arrows/medium-blue.svg";
            }

        const isAuthorized = user && (user.role === "admin" || Number(user.id) === Number(rec.user_id))
        return `
        <div class="recommendation" data-id="${rec.id}" data-ticker="${rec.ticker}" data-type="${rec.asset_type_id ?? 'asset'}" style="cursor: pointer;">

            <img src="${recoImage}" style="width: 50px; height: 50px; object-fit: contain;" alt="reco-image" />
            <strong>${rec.status}</strong>
            <img src="${imageUrl}" style="width: 50px; height: 50px; object-fit: contain;" alt="analyst-picture" />
            <p>${rec.ticker}</p>
            <p>${rec.comment}</p>
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
    // click event
    container.onclick = (e) => {
        if (
            e.target.classList.contains("delete-btn") || 
            e.target.closest(".edit-form") || 
            e.target.tagName === "SELECT" || 
            e.target.tagName === "INPUT"
        ) {
            return 
        }

        const card = e.target.closest(".recommendation")
        if (!card) return

        const { ticker, type } = card.dataset
        if (ticker) {
            window.location.hash = `#/details?type=${type}&ticker=${ticker}`
        }
    }
}

// =====================
// RENDERING WATCHLIST LIST
// =====================
function renderWatchlistList(watchlist) {
    console.log(watchlist)

    const globalContainer = document.getElementById("watchlist-list-global")
    globalContainer.style.display = "flex"

    if (watchlist.length < 5) {
        globalContainer.style.display = "none"    
    } else {
        globalContainer.style.display = "flex"
    }

    const container = document.getElementById("watchlist-list-container")
    if (!container) return
   
    container.innerHTML = watchlist.map(item => {
        const defaultAvatar = "/assets/logo/nasdaq_logo.png"
        const imageUrl = `/assets/logos/${item.ticker.toLowerCase()}.svg` || defaultAvatar

        return `

            <div class="watchlist-item" data-ticker="${item.ticker}" data-type="${item.asset_type_id}" style="cursor: pointer;">
                <img src="${imageUrl}" style="width: 50px; height: 50px; object-fit: contain;" alt="analyst-picture" />
                <span><strong>${item.ticker}</strong></span>
                <span>${item.name}</span>
            </div>
        `

    } ).join("")

    // click event
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
// FOLLOW PAGINATION
// =====================
function renderFollowList(users, payload, meta) {
    const container = document.getElementById("follow-list-container")
    const paginationDiv = document.getElementById("follow-pagination")

    if (!container || !paginationDiv) return

    container.innerHTML = users.map(a => {
        const defaultAvatar = "/assets/default_analyst.png"
        const imageUrl = a.picture ? `${API_BASE_URL}/uploads/${a.picture}` : defaultAvatar
    

        return `
        <div class="follow-item" data-id="${a.id}" style="cursor: pointer;">
             <img src="${imageUrl}" style="width: 30px; height: 30px; border-radius: 50%; object-fit: cover;" alt="analyst-picture" />
        
            <p><strong>${a.name}</strong> - ${a.company ?? "Unknown"}</p>
        </div>
        `
        
    } ).join("")

    paginationDiv.style.display =
        (meta?.hasNext || meta?.offset > 0) ? "flex" : "none"

    container.onclick = (e) => {
        const item = e.target.closest(".follow-item")
        if (!item) return

        const analystId = item.dataset.id
        window.location.hash = `#/analystdetails?id=${analystId}`
    }
}