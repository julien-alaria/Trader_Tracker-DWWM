import { API_BASE_URL } from "../../config/api.js"
import http from "../../config/instanceHttp.js"
import { decodeToken } from "../../middlewares/roleGuard.js"
import stockCard from "../../components/cards/stockCards.js"
import analystCard from "../../components/cards/analystCard.js"
import analystUpdateForm from "../../components/forms/analystUpdateForm.js"
import { getStock, getForex, getCommodities } from "../../utils/assetsUtils.js"
import { buildWatchlistData } from "../../utils/assetFormatter.js"
import { createCarousel } from "../../components/carousel/carouselComponent.js"
import { createPaginationList } from "../../components/pagination/paginationComponent.js"
import { bindRecommendationActions } from "../../utils/actionManager.js"
import { getRecommendationIcon } from "../../utils/recommendationUtils.js"

// =====================
// HTML TEMPLATE 
// =====================
const analystPage = `
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
        <div id="watchlist-carousel-target"></div>

        <div id="watchlist-list-global">
            <h2>Watchlist By List</h2>
            <div id="watchlist-list-target"></div>
        </div>
    </section>

    <section>
        <h2>My Recommendations</h2>
        <div id="recommendations-list-target"></div>
    </section>

    <section>
        <h2>Followed Analysts</h2>
        <div id="follow-carousel-target"></div>

        <h2>Followed Analysts By List</h2>
        <div id="follow-list-target"></div>
    </section>

    <section>
        <div class="update-form">
            ${analystUpdateForm()}
        </div>
    </section>
`

export default analystPage

// =====================
// STATE GLOBAL
// =====================
let recommendationsPaginator = null
let watchlistPaginator = null
let followPaginator = null

// =====================
// INIT
// =====================
export async function initAnalyst() {
  try {
    // Access Token Security Checks
    const token = localStorage.getItem("token")
    if (!token) return

    const payload = decodeToken(token)
    if (!payload) {
      window.location.hash = "/login"
      return
    }

    // =====================
    // CENTRAL DATA RECOVERY
    // =====================
    const [userRes, watchRes, followRes, stocks, forex, commodities] =
      await Promise.all([
        http.get("/users/me"),
        http.get("/users/me/watchlist"),
        http.get("/users/me/follows/users"),
        getStock(),
        getForex(),
        getCommodities(),
      ])

    const user = userRes.result
    renderAnalystInfo(user)

    const allAssets = [...stocks, ...forex, ...commodities]
    const watchlist = buildWatchlistData(watchRes.result, allAssets)
    const followState = followRes.results || []

    // security waiting before DOM injection
    await new Promise((resolve) => setTimeout(resolve, 0))

    // =====================
    // CAROUSSELS RENDERING
    // =====================
    createCarousel({
      targetSelector: "#watchlist-carousel-target",
      carouselId: "analyst-watchlist-carousel",
      data: watchlist,
      cardComponent: stockCard,
      buildUrl: (dataset) => `#/details?type=${dataset.type}&ticker=${dataset.ticker}`,
    })

    createCarousel({
      targetSelector: "#follow-carousel-target",
      carouselId: "analyst-follow-carousel",
      data: followState,
      cardComponent: analystCard,
      buildUrl: (dataset) => `#/analystdetails?id=${dataset.id}`,
    })

    // =====================
    // PAGINATION RENDERING
    // =====================

    // WATCHLIST PAGINATOR
    watchlistPaginator = createPaginationList({
      targetSelector: "#watchlist-list-target",
      prefix: "watchlist",
      endpoint: "/users/me/watchlist-paginated",
      itemTemplate: (item) => {
        const defaultLogo = "/assets/logos/nasdaq_logo.png"
        const logoUrl = item.ticker ? `/assets/logos/${item.ticker.toLowerCase()}.svg`: defaultLogo

        return `
          <div class="watchlist-item" data-js-clickable data-ticker="${item.ticker}" data-type="${item.asset_type_id}">
              <img src="${logoUrl}" width="50" height="50" alt="${item.ticker}onerror="this.src='${defaultLogo}'" />
              <span><strong>${item.ticker}</strong></span>
              <span>${item.name}</span>
          </div>
        `
      },
      buildUrl: (dataset) => `#/details?type=${dataset.type}&ticker=${dataset.ticker}`,
    })

    // RECOMMANDATIONS PAGINATOR
    recommendationsPaginator = createPaginationList({
      targetSelector: "#recommendations-list-target",
      prefix: "recommendations",
      endpoint: "/recommendations/me",
      itemTemplate: (rec) => {
        const defaultAvatar = "/assets/logos/nasdaq_logo.png"
        const imageUrl = rec.ticker ? `/assets/logos/${rec.ticker.toLowerCase()}.svg` : defaultAvatar

        const recoImage = getRecommendationIcon(rec.status)

        const isAuthorized = user && (user.role === "admin" || Number(user.id) === Number(rec.user_id))

        return `
          <div class="recommendation" data-js-clickable data-id="${rec.id}" data-ticker="${rec.ticker}" data-type="${rec.asset_type_id ?? 'asset'}">
              <img src="${recoImage}" width="50" height="50" alt="reco-image" />
              <strong>${rec.status}</strong>
              <img src="${imageUrl}" width="50" height="50" alt="analyst-picture" onerror="this.src='${defaultAvatar}'" />
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
      },
      buildUrl: (dataset) => `#/details?type=${dataset.type}&ticker=${dataset.ticker}`,
    })

    // FOLLOW PAGINATOR
    followPaginator = createPaginationList({
      targetSelector: "#follow-list-target",
      prefix: "follow",
      endpoint: "/users/me/follows/users",
      itemTemplate: (a) => {
        const defaultAvatar = "/assets/analyst/default_analyst.png"
        const avatarUrl = a.picture ? `${API_BASE_URL}/uploads/${a.picture}` : defaultAvatar

        return `
          <div class="follow-item" data-js-clickable data-id="${a.id}">
               <img src="${avatarUrl}" width="30" height="30" alt="${a.name}"onerror="this.src='${defaultAvatar}'" />
               <p><strong>${a.name}</strong> - ${a.company ?? "Unknown"}</p>
          </div>
        `
      },
      buildUrl: (dataset) => `#/analystdetails?id=${dataset.id}`,
    })

    await recommendationsPaginator.load()
    await watchlistPaginator.load()
    await followPaginator.load()

    // display logic of the global Watchlist block
    const globalContainer = document.getElementById("watchlist-list-global")
    if (globalContainer) {
      globalContainer.style.display = watchRes.result.length < 5 ? "none" : "flex"
    }

    // Initializing click listeners
    bindRecommendationActions("#recommendations-list-target", recommendationsPaginator)
    initLocalUpdateForm(user)

  } catch (err) {
    console.error("ANALYST INIT ERROR:", err)
  }
}

// =====================
// LOCAL FEATURES LOGIC FUNCTIONS
// =====================

// rendering local user infos
function renderAnalystInfo(user) {
  const map = {
    analyst_id: user.id,
    analyst_name: user.name,
    analyst_email: user.email,
    analyst_type: user.analyst_type_id,
    analyst_company: user.company,
    analyst_bio: user.bio,
  }

  Object.entries(map).forEach(([id, value]) => {
    const el = document.getElementById(id)
    if (el) el.textContent = value ?? "N/A"
  })

  const imageEl = document.getElementById("analyst_picture")
  if (imageEl) {
    imageEl.src = user.picture
      ? `${API_BASE_URL}/uploads/${user.picture}`
      : "/assets/default_analyst.png"
    imageEl.alt = `${user.name || "analyst"}`
  }
}

// update local form
function initLocalUpdateForm(user) {
  const form = document.getElementById("analyst-update-form")
  if (!form) return

  const fields = {
    "analyst-name": user.name,
    "analyst-email": user.email,
    "analyst-company": user.company,
    "analyst-bio": user.bio,
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