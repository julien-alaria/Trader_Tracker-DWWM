import { formatAssetImage } from "../../utils/imageHelper.js"

export default function stockCard({
  ticker = 'N/A', 
  name = 'Unknown company', 
  marketCap = 0, 
  high, 
  low, 
  image, 
  price = "N/A",
  history = []
} = {}) {

  const finalImage = formatAssetImage(ticker)

  return `
    <div class="card stock" data-type="stock" data-ticker="${ticker}">

        <div class="chart" id="tv-${ticker}" data-ticker="${ticker}" data-history='${JSON.stringify(history)}'></div>

        <img class="card-stock-image" src="${finalImage}" alt="${ticker}" onerror="this.onerror=null; this.src='/assets/nasdaq_logo.webp'">

        <h2 class="card-stock-title">${name}</h2>

        <p class="card-stock-description">${ticker}</p>

        <p class="card-stock-market">Market Cap: ${marketCap}</p>

        <p class="card-stock-price">${price} USD</p>

        <p class="card-stock-high">High: ${high}</p>

        <p class="card-stock-low">Low: ${low}</p>

    </div>
  `
}