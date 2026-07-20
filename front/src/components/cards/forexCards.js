// forexCards.js
import { formatAssetImage } from "../../utils/imageHelper.js"
import { escapeHtml } from "../../utils/format.js"

export default function forexCard({ 
  ticker = 'N/A', 
  name = 'Unknown pair', 
  high = 'N/A', 
  low = 'N/A', 
  close = 'N/A', 
  image 
} = {}) {

  const finalImage = formatAssetImage(ticker)

  return `
    <div class="card forex" data-type="forex" data-ticker="${escapeHtml(ticker)}">

      <img class="card-image-forex" src="${finalImage}" alt="${escapeHtml(ticker)}" onerror="this.onerror=null; this.src='/assets/nasdaq_logo.webp'">

      <h2 class="card-title-forex">${escapeHtml(name)}</h2>

      <p class="card-forex-ticker">Ticker: ${escapeHtml(ticker)}</p>

      <p class="card-forex-price">Price: ${escapeHtml(close)}</p>

      <p class="card-forex-high">High: ${escapeHtml(high)}</p>

      <p class="card-forex-low">Low: ${escapeHtml(low)}</p>

    </div>
  `
}