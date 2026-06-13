import { getStock, getForex, getCommodities } from "../../utils/assetsUtils.js"
import { loadTradingViewChart } from "../../utils/tradingChart.js"
import http from "../../config/instanceHttp.js"
import { decodeToken } from "../../middlewares/roleGuard.js"
import { formatChartId, formatMarketCap, formatDate } from "../../utils/format.js"
import analystCard from "../../components/cards/analystCard.js"
import recoForm from "../../components/recommendations/recoForm.js"
import { enableCarouselWindow } from "../../utils/lazyloading.js"
import { createPaginator } from "../../utils/pagination.js"

let recommendationsPaginator

const commodityImages = {
    "C:XAUUSD": "/assets/gold.png",
    "C:XAGUSD": "/assets/silver.png",
    "C:XPTUSD": "/assets/platinum.png",
    "C:COPPERUSD": "/assets/copper.png",
    "C:XPDUSD": "/assets/palladium.png"
}

const detailsPage = `
    <main>
        <section id="detail-section">
            <h1>Details Page</h1>
            <div id="asset-detail"></div> 
        </section>

        <section id="recomendations-section">
            <div id="recommendation-container"></div>

            <div id="pagination">
                <button id="prev-btn">Previous</button>
                <button id="next-btn">Next</button>
            </div>

            <div id="recommendation-form"></div>
        </section>

        <section id="analyst-carousel-section">
            <div id="analyst-carousel-section" class="hidden">
                <h2>Analysts covering this asset</h2>
                <div class="carousel analyst-carousel"></div>
            </div>
        </section>

        <section id="analyst-list-section">
            <h2>All Analysts</h2>
            <div id="analyst-list-container"></div>
            
            <div id="analyst-pagination" style="display: none;">
                <button id="analyst-prev-btn">Previous</button>
                <button id="analyst-next-btn">Next</button>
            </div>
        </section>

        
    </main>
`

export async function initDetail() {
    try {
        const hash = window.location.hash
        const queryIndex = hash.indexOf("?")
        const query = queryIndex !== -1 ? hash.substring(queryIndex + 1) : ""
        const params = new URLSearchParams(query)
        const ticker = params.get("ticker")

        if (!ticker) {
            document.getElementById("asset-detail").innerHTML = "<p>Missing ticker</p>"
            return
        }

        // ASSETS FETCHING
        const [stocks, forex, commodities] = await Promise.all([
            getStock(), getForex(), getCommodities()
        ])
        const allAssets = [...stocks, ...forex, ...commodities]
        const asset = allAssets.find(item =>
            String(item.ticker ?? "").trim().toUpperCase() === String(ticker).trim().toUpperCase()
        )

        if (!asset) {
            document.getElementById("asset-detail").innerHTML = "<p>Asset not found</p>"
            return
        }

        // STANDARDIZATION OF IMAGE & LOGO LOGIC
        let finalImage = asset.image || "/assets/default.png";
        let fallbackImage = "/assets/default.png";

        if (asset.type === "nasdaq") {
            finalImage = asset.image || "/assets/nasdaq_logo.svg.png";
            fallbackImage = "/assets/nasdaq_logo.svg.png";
        } else if (asset.type === "commodity") {
            finalImage = commodityImages[asset.ticker] || "/assets/default.png";
            fallbackImage = "/assets/default.png";
        } else if (asset.type === "forex") {
            finalImage = "/assets/forex_logo.png";
            fallbackImage = "/assets/forex_logo.png";
        }

        // USER & WATCHLIST
        const token = localStorage.getItem("token")
        const user = token ? decodeToken(token) : null

        const watchRes = user ? await http.get(`/users/me/watchlist`) : { result: [] };
        const isFollowed = watchRes.result?.some(w => w.ticker === asset.ticker);

       // PAGE RENDERING WITH LOGO
        const chartId = formatChartId(asset.ticker)
        document.getElementById("asset-detail").innerHTML = `
            <button onclick="history.back()" class="btn-back">Back</button>
            
            <div class="asset-header">
                <img class="asset-logo" 
                     src="${finalImage}" 
                     alt="${asset.ticker}" 
                     onerror="this.onerror=null; this.src='${fallbackImage}';">
                <div class="asset-title-container">
                    <h1 class="asset-name">${asset.name}</h1>
                    <span class="asset-ticker">${asset.ticker}</span>
                </div>
            </div>

            <button id="follow-toggle-btn" class="detail-btn" data-ticker="${asset.ticker}" data-followed="${isFollowed}">
                <span class="follow-icon">${isFollowed ? "×" : "+"}</span>
                <span class="follow-text">${isFollowed ? "Remove" : "Track Asset"}</span>
            </button>
            
            <div class="asset-info">
                <div>PRICE: ${asset.price ?? "N/A"}</div>
                <div>MARKET CAP: ${asset.marketCap ? formatMarketCap(asset.marketCap) : "N/A"}</div>
                <div>HIGH: ${asset.high ?? "N/A"}</div>
                <div>LOW: ${asset.low ?? "N/A"}</div>
            </div>
            
            <div id="${chartId}"></div>
        `

        // FOLLOW EVENT LISTENER
        const followBtn = document.getElementById("follow-toggle-btn");
        followBtn.addEventListener("click", async () => {
            const currentStatus = followBtn.dataset.followed === "true";
            const ticker = followBtn.dataset.ticker;
            followBtn.disabled = true;
            try {
                if (currentStatus) {
                    await http.delete(`/users/me/follows/${ticker}`);
                    followBtn.dataset.followed = "false";
                    followBtn.textContent = "☆ Follow";
                } else {
                    await http.post("/users/me/follows", { ticker });
                    followBtn.dataset.followed = "true";
                    followBtn.textContent = "⭐ Unfollow";
                }
            } catch (err) {
                console.error("Follow error:", err);
            } finally {
                followBtn.disabled = false;
            }
        });

        // CHARTS & RECOMMENDATIONS
        loadTradingViewChart(asset.ticker, asset.history);

        try {
            // RECOMMENDATIONS
            const recommendationRes = await http.get(`/recommendations?ticker=${asset.ticker}`);
            const recommendations = recommendationRes.results || [];

            const container = document.getElementById("recommendation-container");
            container.innerHTML = recommendations.length > 0
                ? `<h3 id="reco-title">Analysts Recommendations</h3>` + recommendations.map(rec => `
                    <div class="recommendation">
                        <strong>${rec.status}</strong>
                        <p>${rec.comment}</p>
                        <p><small>Analyst: ${rec.analyst_name ?? "unknown"}</small></p>
                        <p><small>Published on ${formatDate(rec.created_at)}</small></p>
                    </div>`).join("")
                : "<p>No recommendations yet</p>";

        } catch (err) {
            console.error("Erreur chargement recommandations:", err);
            document.getElementById("recommendation-container").innerHTML = "<p>Error loading recommendations</p>";
        }
        
        // ANALYSTS CARROUSEL
        const dbAsset = await http.get(`/assets/details/${ticker}`)

        try {
            const analystRes = await http.get(`/users/analysts/by-type?type_id=${dbAsset.asset_type_id}`);
            const analysts = analystRes.results;

            if (analysts && analysts.length > 0) {
                document.getElementById("analyst-carousel-section").classList.remove("hidden");
                
                enableCarouselWindow({
                    selector: ".analyst-carousel",
                    batchSize: 3,
                    getData: () => analysts, 
                    cardComponent: analystCard
                });
            }

        } catch (e) {
            console.error("Impossible de charger les analystes:", e)
        }

        // ANALYSTS LIST PAGINATION
        // LIST DISPLAY
        const renderAnalystList = (analysts, payload, meta) => {
            const container = document.getElementById("analyst-list-container")
            const paginationDiv = document.getElementById("analyst-pagination")

            container.innerHTML = analysts.map(a => `
                <div class="analyst-item" data-id="${a.id}">
                    <span><strong>${a.name}</strong> - ${a.company}</span>
                </div>
            `).join("")

            // btn visibility
            paginationDiv.style.display = (analysts.length === 0 && (!meta || meta.offset === 0)) 
                ? "none" 
                : "flex"
        }

     // PAGINATOR
        const analystPaginator = createPaginator({
            endpoint: `/users/analysts?limit=3`,
            render: renderAnalystList,
            mapResponse: (res) => ({
                results: res.results,
                hasNext: res.meta.hasNext
            })
        });

        await analystPaginator.load()

        analystPaginator.bind({
            nextBtn: document.getElementById("analyst-next-btn"),
            prevBtn: document.getElementById("analyst-prev-btn")
        })

        // RECOMMENDATION FORM
        const canRecommend = user && (user.role === "admin" || (user.role === "analyst" && user.analyst_type_id === dbAsset.asset_type_id))
        const formContainer = document.getElementById("recommendation-form")
        
        if (canRecommend) {
            formContainer.innerHTML = recoForm()
            const recForm = document.getElementById("rec-form")
            if (recForm) {
                recForm.addEventListener("submit", async (e) => {
                    e.preventDefault()
                    const messageDiv = document.getElementById("message")
                    messageDiv.innerText = "Processing..."
                    const data = new FormData(e.target)
                    try {
                        await http.post("/recommendations", {
                            status: data.get("status"),
                            comment: data.get("comment"),
                            ticker: asset.ticker
                        })
                        messageDiv.innerText = "Recommendation successful"
                        setTimeout(async () => { await initDetail() }, 1000)
                    } catch (err) {
                        messageDiv.innerText = err.response?.data?.message || "Recommendation error."
                    }
                })
            }
        } else if (user) {
            formContainer.innerHTML = `<p>${user.role === "analyst" ? "Your specialization does not allow you to recommend this asset." : "Only analysts can post."}</p>`
        } else {
            formContainer.innerHTML = `<div class=login-message>
            <p><strong>Want to post a recommendation?</strong></p>
            <button class="detail-btn" id="login-btn" onclick="window.location.hash='#/login'">Log In as Analyst</button>
            </div>`
        }

        const renderRecommendations = (recs, payload, meta) => {
            const container = document.getElementById("recommendation-container");
            const paginationDiv = document.getElementById("pagination")

            if (!paginationDiv) return; // Sécurité

            container.innerHTML = recs.length > 0
                ? `<h3 id="reco-title">Analysts Recommendations</h3>` + recs.map(rec => `
                    <div class="recommendation">
                        <strong>${rec.status}</strong>
                        <p>${rec.comment}</p>
                        <p><small>Analyst: ${rec.analyst_name ?? "unknown"}</small></p>
                        <p><small>Published on ${formatDate(rec.created_at)}</small></p>
                    </div>`).join("")
                : "<p>No recommendations yet</p>"

            if (recs.length === 0 && (!meta || meta.offset === 0)) {
                paginationDiv.style.display = "none"
            } else {
                paginationDiv.style.display = "flex"
            }
        }

        // PAGINATOR
        recommendationsPaginator = createPaginator({
            endpoint: `/recommendations?ticker=${ticker}`,
            limit: 3,
            render: (recs) => renderRecommendations(recs),
            mapResponse: (res) => res 
        })

        await recommendationsPaginator.load();

        recommendationsPaginator.bind({
            nextBtn: document.getElementById("next-btn"),
            prevBtn: document.getElementById("prev-btn")
        })

        enableCarouselWindow({
            selector: ".analyst-carousel",
            batchSize: 3, 
            getData: () => mesAnalystesRecuperes,
            cardComponent: analystCard
        })

    } catch (error) {
        console.error("DETAILS INIT ERROR:", error)
    }
}

export default detailsPage