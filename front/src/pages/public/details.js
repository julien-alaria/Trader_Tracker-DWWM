import { getStock, getForex, getCommodities } from "../../utils/assetsUtils.js"
import { loadTradingViewChart } from "../../utils/tradingChart.js"
import http from "../../config/instanceHttp.js"
import { decodeToken } from "../../middlewares/roleGuard.js"
import { formatChartId, formatMarketCap } from "../../utils/format.js"
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

        // ASSETS
        const [stocks, forex, commodities] = await Promise.all([
            getStock(),
            getForex(),
            getCommodities()
        ])

        const allAssets = [...stocks, ...forex, ...commodities]

        const asset = allAssets.find(item =>
            String(item.ticker ?? "").trim().toUpperCase() ===
            String(ticker).trim().toUpperCase()
        )

        if (!asset) {
            document.getElementById("asset-detail").innerHTML =
                "<p>Asset not found</p>"
            return
        }

        // USER
        const token = localStorage.getItem("token")
        const user = token ? decodeToken(token) : null

        // ASSET RENDER 
        const chartId = formatChartId(asset.ticker)
        console.log("ASSET", asset)

        document.getElementById("asset-detail").innerHTML = `
            <button onclick="history.back()">Back</button>

            <h2>ASSET: ${asset.name}</h2>
            <div>PRICE: ${asset.price}</div>
            <div>MARKET CAP: ${asset.marketCap}</div>
            <div>HIGH: ${asset.high}</div>
            <div>LOW: ${asset.low}</div>

            <div id="${chartId}"></div>
        `

        // CHART 
        loadTradingViewChart(asset.ticker, chartId)

        // RECOMMENDATIONS 
        const recommendationRes = await http.get(`/recommendations?ticker=${asset.ticker}`)
        const recommendations = recommendationRes.results || []

        const recommendationContainer = document.getElementById("recommendation-container")

        recommendationContainer.innerHTML = recommendations.length
            ? `
                <h3>Analysts Recommendations</h3>
                ${recommendations.map(rec => `
                    <div class="recommendation">
                        <strong>${rec.status}</strong>
                        <p>${rec.comment}</p>
                        <small>Analyst: ${rec.analyst_name ?? "unknown"}</small>
                        <button class="delete-btn" data-id="${rec.id}">DELETE</button>
                    </div>
                `).join("")}
            `
            : "<p>No recommendations yet</p>"

        
        recommendationContainer.addEventListener("click", async (e) => {
   
            if (e.target.classList.contains("delete-btn")) {
                const recId = e.target.dataset.id;
                const recommendationDiv = e.target.closest(".recommendation") 
                
                try {
                    await http.delete(`/recommendations/${recId}`)
                    recommendationDiv.remove() 
                    console.log("Suppression réussie.")
                } catch (err) {
                    console.error("Erreur suppression:", err)
                }
            }
        })

        //FORM PERMISSION
        // Récupération des détails ticker = asset_id
        const dbAsset = await http.get(`/assets/details/${ticker}`)
        
        console.log("Accès autorisé, Asset trouvé :", dbAsset)
        
        const canRecommend =
            user &&
            (
                user.role === "admin" ||
                (user.role === "analyst" &&
                    user.analyst_type_id === dbAsset.asset_type_id)
            )

        const formContainer = document.getElementById("recommendation-form")

        if (canRecommend) {
            formContainer.innerHTML = `
                ${recoForm()}
            `

            // FORM HANDLER
            const recForm = document.getElementById("rec-form")
            
            if (recForm) {
                recForm.addEventListener("submit", async (e) => {
                    e.preventDefault()

                    const messageDiv = document.getElementById("message")

                    messageDiv.innerText = ""

                    const data = new FormData(e.target)

                    try {
                        await http.post("/recommendations", {
                            status: data.get("status"),
                            comment: data.get("comment"),
                            ticker: asset.ticker
                        })

                        messageDiv.innerText = "Recommendation successful"

                        setTimeout(async () => {
                            await initDetail() 
                        }, 1000)
                        
                    } catch (err) {
                        messageDiv.innerText = err.response?.data?.message || "Recommendation error."
                        console.error("Recommendation error:", err)
                    }
                })
            }

        } else {

            if (user && user.role === "analyst") {

                formContainer.innerHTML = `<p>Your specialization does not allow you to recommend this asset.</p>`;

            } else if (user && user.role === "user") {

                formContainer.innerHTML = `<p>Only analysts are allowed to post recommendations.</p>`;

            } else if (!user) {

                formContainer.innerHTML = `
                    <div class="login-prompt">
                        <p>Want to post a recommendation?</p>
                        <button onclick="window.location.hash='#/login'">Log In to your Analyst Account</button>
                    </div>
                `;
            }
        }

    } catch (error) {
        console.error("DETAILS INIT ERROR:", error)
    }
}

export default detailsPage