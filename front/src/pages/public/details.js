import { getStock, getForex, getCommodities  } from "../utils/assetsUtils.js"
import { loadTradingViewChart } from "../../../src/utils/tradingChart.js"
import http from "../../config/instanceHttp.js"
import { decodeToken } from "../../middlewares/roleGuard.js"

const detailsPage = `
<main>
    <h1>Details Page</h1>
    <div id="asset-detail"></div> 
    <div id="recommendation-container"></div>
    <div id="recommendation-form"></div>
</main>
`

export async function initDetail() {

    const hash = window.location.hash
    
    const queryIndex = hash.indexOf("?")
    const query = queryIndex !== -1 ? hash.substring(queryIndex + 1) : ""

    const params = new URLSearchParams(query)

    const ticker = params.get("ticker")

    const stocks = await getStock()
    const forex = await getForex()
    const commodities = await getCommodities()

    const allAssets = [
        ...stocks,
        ...forex,
        ...commodities
    ]

    const asset = allAssets.find(item => {

        return (
            String(item.ticker ?? "").trim().toUpperCase() ===
            String(ticker ?? "").trim().toUpperCase()
        )
    })

    if (!asset) {
        document.getElementById("asset-detail").innerHTML =
            "<p>Asset not found</p>"
        return
    }

    const token = localStorage.getItem("token")
    const user = token ? decodeToken(token) : null

    document.getElementById("asset-detail").innerHTML = `
        <button onclick="history.back()">Back</button>

        <h2>ASSET: ${asset.name}</h2>
        <div>PRICE: ${asset.price}</div>
        <div> MARKET CAP: ${asset.marketCap ?? "N/A"}</div>
        <div>HIGH: ${asset.high}</div>
        <div>LOW: ${asset.low}</div>
        <div id="tv-${asset.ticker}"></div>
    `

    if (asset.marketCap) {
        loadTradingViewChart(asset.ticker)
    }

    const recommendationRes =
    await http.get(`/recommendations?ticker=${asset.ticker}`)

    const recommendations = recommendationRes.results || []

    const recommendationContainer = document.getElementById("recommendation-container")

    if (!recommendations.length) {
        recommendationContainer.innerHTML = "<p>No recommendations yet</p>"
    } else {
        const html = `
            <h3>Analysts Recommendations</h3>
            ${recommendations.map(rec => `
                <div class="recommendation">
                    <strong>${rec.status}</strong>
                    <p>${rec.comment}</p>
                    <small>Analyst: ${rec.analyst_name ?? "unknown"}</small>
                </div>
            `).join("")}
        `

        recommendationContainer.innerHTML = html
    }

    const canRecommend =
    user &&
    (
        user.role === "admin" ||
        (user.role === "analyst" && 
         user.analyst_type_id === asset.asset_type_id)
    )

    const formContainer = document.getElementById("recommendation-form")

    if (canRecommend) {
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
            </form>
        `

        document.getElementById("rec-form").addEventListener("submit", async (e) => {
            e.preventDefault()

            const data = new FormData(e.target)
            await http.post("/recommendations", {
                status: data.get("status"),
                comment: data.get("comment"),
                ticker: asset.ticker
            })

            window.location.reload()
        })
    }
}

export default detailsPage