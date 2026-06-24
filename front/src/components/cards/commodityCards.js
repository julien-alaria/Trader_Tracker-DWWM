import { formatAssetImage } from "../../utils/imageHelper.js"

export default function commodityCard({ name, ticker, price, high, low, image } = {}) {

  const finalImage = formatAssetImage(ticker)

  return `
    <div class="card commodity" data-type="commodity" data-ticker="${ticker}">

      <img class="card-commodity-image" src="${finalImage}" alt="${ticker}" >

      <h2 class="card-commodity-title">${name}</h2>

      <p class="card-commodity-ticker">Ticker: ${ticker}</p>

      <p class="card-commodity-price">$${price}</p>

      <p class="card-commodity-high">High: ${high}</p>

      <p class="card-commodity-low">Low: ${low}</p>

    </div>
  `
}