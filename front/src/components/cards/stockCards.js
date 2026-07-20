// stockCards.js
import { formatAssetImage } from "../../utils/imageHelper.js"
import { formatChartId, escapeHtml } from "../../utils/format.js"

export default function stockCard({
  ticker = 'N/A', 
  name = 'Unknown company', 
  marketCap = 0, 
  high = 'N/A', 
  low = 'N/A', 
  image, 
  price = "N/A",
  history = []
} = {}) {

  const finalImage = formatAssetImage(ticker)
  const chartId = formatChartId(ticker) 

  return `
    <div class="card stock" data-type="stock" data-ticker="${escapeHtml(ticker)}">

        <div class="chart" id="${chartId}" data-ticker="${escapeHtml(ticker)}" data-history='${JSON.stringify(history)}'></div>

        <img class="card-stock-image" src="${finalImage}" alt="${escapeHtml(ticker)}" onerror="this.onerror=null; this.src='/assets/nasdaq_logo.webp'">

        <h2 class="card-stock-title">${escapeHtml(name)}</h2>

        <p class="card-stock-description">${escapeHtml(ticker)}</p>

        <p class="card-stock-market">Market Cap: ${escapeHtml(marketCap)}</p>

        <p class="card-stock-price">${escapeHtml(price)} USD</p>

        <p class="card-stock-high">High: ${escapeHtml(high)}</p>

        <p class="card-stock-low">Low: ${escapeHtml(low)}</p>

    </div>
  `
}