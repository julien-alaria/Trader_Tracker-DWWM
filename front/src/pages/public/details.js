import { getStock, getForex, getCommodities, getStockFromJson, getForexFromJson, getCommoditiesFromJson } from "../utils/assetsUtils.js"
import { loadTradingViewChart } from "../../../src/utils/tradingChart.js"

const detailsPage = `
<main>
    <h1>Details Page</h1>
    <div id="asset_detail"></div> 
</main>
`

export async function initDetail() {

    const hash = window.location.hash

    console.log("RAW HASH:", hash)

    const queryIndex = hash.indexOf("?")

    const query = queryIndex !== -1 ? hash.substring(queryIndex + 1) : ""

    const params = new URLSearchParams(query)

    const ticker = params.get("ticker")

    console.log("TICKER:", ticker)

    // POUR API
    //const stocks = await getStock()
    //const forex = await getForex()
    //const commodities = await getCommodities()

    const stocks = await getStockFromJson()
    const forex = await getForexFromJson()
    const commodities = await getCommoditiesFromJson()

    const allAssets = [
        ...stocks,
        ...forex,
        ...commodities
    ]

   const asset = allAssets.find(item => {
        console.log("compare:", item.ticker, ticker)

        return (
            String(item.ticker ?? "").trim().toUpperCase() ===
            String(ticker ?? "").trim().toUpperCase()
        )
    })

    console.log("URL ticker:", ticker)
    console.log("allAssets:", allAssets.map(a => a.ticker))
    console.log("RAW HASH:", window.location.hash)
    console.log("TICKER:", ticker)

    if (!asset) {
        document.getElementById("asset_detail").innerHTML =
            "<p>Asset not found</p>"
        return
    }

    document.getElementById("asset_detail").innerHTML = `
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

    
}

export default detailsPage