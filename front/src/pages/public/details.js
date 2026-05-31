import { getStock, getForex, getCommodities  } from "../utils/assetsUtils.js"
import { loadTradingViewChart } from "../../../src/utils/tradingChart.js"
import http from "../../config/instanceHttp.js"

const detailsPage = `
<main>
    <h1>Details Page</h1>
    <div id="asset-detail"></div> 
    <div id="recommendation-container"></div>
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
    await http.get(`/recommendations?asset_id=${asset.id}`)

    const recommendations =
        recommendationRes.results || []

    const recommendationContainer =
        document.getElementById("recommendation-container")

    if (!recommendations.length) {

        recommendationContainer.innerHTML =
            "<p>No recommendations yet</p>"

    } else {

        recommendationContainer.innerHTML =
            recommendations.map(rec => `
                <div class="recommendation">

                    <strong>${rec.status}</strong>

                    <p>${rec.comment}</p>

                    <small>
                        Analyst: ${rec.analyst_name ?? "unknown"}
                    </small>

                </div>
            `).join("")
    }
}

export default detailsPage