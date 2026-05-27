import { getStock, getForex, getCommodities } from "../utils/assetsUtils.js"
import { loadTradingViewChart } from "../../../src/utils/tradingChart.js"

const detailsPage = `
<main>
    <h1>Details Page</h1>
    <div id="asset_detail"></div> 
</main>
`

export async function initDetail(ticker = "INTC") {

    const stocks = await getStock()
    const forex = await getForex()
    const commodities = await getCommodities()

    const allAssets = [
        ...stocks,
        ...forex,
        ...commodities
    ]

    const asset = allAssets.find(item => item.ticker === ticker)

    if (!asset) {
        document.getElementById("asset_detail").innerHTML =
            "<p>Asset not found</p>"
        return
    }

    document.getElementById("asset_detail").innerHTML = `
        <h2>ASSET: ${asset.name}</h2>
        <div>PRICE: ${asset.price}</div>
        <div>${asset.marketCap}</div>
        <div>HIGH: ${asset.high}</div>
        <div>LOW: ${asset.low}</div>
        <div id="tv-${asset.ticker}"></div>
    `

    loadTradingViewChart(asset.ticker)
}

export default detailsPage