import { formatAssetImage } from "../../utils/imageHelper.js"

export default function forexCard({ ticker, name, high, low, close, image } = {}) {

  const finalImage = formatAssetImage(ticker) || "/assets/default.png"

  return `
    <div class="card forex" data-type="forex" data-ticker="${ticker}" >

      <img class="card-image-forex" src="${finalImage}" alt="${ticker}">

      <h2 class="card-title-forex">${name}</h2>

      <p class="card-forex-ticker">Ticker: ${ticker}</p>

      <p class="card-forex-price">Price: ${close}</p>

      <p class="card-forex-high">High: ${high}</p>

      <p class="card-forex-low">Low: ${low}</p>

    </div>
  `
}