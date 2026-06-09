import { getStock, getForex, getCommodities } from "../../utils/assetsUtils.js"
import { loadTradingViewChart } from "../../utils/tradingChart.js"
import http from "../../config/instanceHttp.js"
import { decodeToken } from "../../middlewares/roleGuard.js"
import { formatChartId, formatMarketCap, formatDate } from "../../utils/format.js"
import recoForm from "../../components/recommendations/recoForm.js"

const detailsPage = `
<main>
    <h1>Details Page</h1>
    <div id="asset-detail"></div> 
    <div id="recommendation-container"></div>
    <div id="recommendation-form"></div>
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

        //ASSETS
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

        //USER & WATCHLIST
        const token = localStorage.getItem("token")
        const user = token ? decodeToken(token) : null

        const watchRes = user ? await http.get(`/users/me/watchlist`) : { result: [] };
        const isFollowed = watchRes.result?.some(w => w.ticker === asset.ticker);

        //PAGE RENDERING
        const chartId = formatChartId(asset.ticker)
        document.getElementById("asset-detail").innerHTML = `
            <button onclick="history.back()">Back</button>
            <h2>ASSET: ${asset.name}</h2>
            <button id="follow-toggle-btn" data-ticker="${asset.ticker}" data-followed="${isFollowed}">
                ${isFollowed ? "⭐ Unfollow" : "☆ Follow"}
            </button>
            <div>PRICE: ${asset.price}</div>
            <div>MARKET CAP: ${asset.marketCap}</div>
            <div>HIGH: ${asset.high}</div>
            <div>LOW: ${asset.low}</div>
            <div id="${chartId}"></div>
        `;

        //FOLLOW 
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

        //CHARTS & RECOMMENDATIONS
        loadTradingViewChart(asset.ticker, asset.history);
        const recommendationRes = await http.get(`/recommendations?ticker=${asset.ticker}`)
        const recommendations = recommendationRes.results || []
        document.getElementById("recommendation-container").innerHTML = recommendations.length
            ? `<h3>Analysts Recommendations</h3>${recommendations.map(rec => `
                <div class="recommendation">
                    <strong>${rec.status}</strong>
                    <p>${rec.comment}</p>
                    <small><p>Analyst: ${rec.analyst_name ?? "unknown"}</p></small>
                    <small><p>Published on ${formatDate(rec.created_at)}</p></small>
                </div>`).join("")}`
            : "<p>No recommendations yet</p>";
        
        //RECOMMENDATION FORM
        const dbAsset = await http.get(`/assets/details/${ticker}`)
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
            formContainer.innerHTML = `<p>${user.role === "analyst" ? "Your specialization does not allow you to recommend this asset." : "Only analysts can post."}</p>`;
        } else {
            formContainer.innerHTML = `<div class="login-prompt"><p>Want to post a recommendation?</p><button onclick="window.location.hash='#/login'">Log In as Analyst</button></div>`;
        }

    } catch (error) {
        console.error("DETAILS INIT ERROR:", error)
    }
}

export default detailsPage