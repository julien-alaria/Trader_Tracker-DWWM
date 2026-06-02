import { getStock, getForex, getCommodities } from "../utils/assetsUtils.js"
import { loadTradingViewChart } from "../../utils/tradingChart.js"
import http from "../../config/instanceHttp.js"
import { decodeToken } from "../../middlewares/roleGuard.js"
import { formatChartId, formatMarketCap } from "../../utils/format.js"


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

        document.getElementById("asset-detail").innerHTML = `
            <button onclick="history.back()">Back</button>

            <h2>ASSET: ${asset.name}</h2>
            <div>PRICE: ${asset.price}</div>
            <div>MARKET CAP: ${formatMarketCap(asset.marketCap)}</div>
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
                    </div>
                `).join("")}
            `
            : "<p>No recommendations yet</p>"

        //FORM PERMISSION
        const canRecommend =
            user &&
            (
                user.role === "admin" ||
                (user.role === "analyst" &&
                    user.analyst_type_id === asset.asset_type_id)
            )

        const formContainer = document.getElementById("recommendation-form")

        //if (!canRecommend) return

        formContainer.innerHTML = `
            <h3>Create Recommendation</h3>

            <form id="rec-form">
                <select name="status">
                    <option value="BUY">BUY</option>
                    <option value="SELL">SELL</option>
                    <option value="HOLD">HOLD</option>
                </select>

                <textarea name="comment" placeholder="Comment"></textarea>

                <button type="submit">Submit</button>
                <div id="message"></div>
            </form>
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
                        // clean refresh (no full reload)
                        await initDetail() 
                    }, 1000)
                    
                } catch (err) {
                    messageDiv.innerText = err.response?.data?.message || "Recommendation error."
                    console.error("Recommendation error:", err)
                }
            })
        }

    } catch (error) {
        console.error("DETAILS INIT ERROR:", error)
    }
}

export default detailsPage