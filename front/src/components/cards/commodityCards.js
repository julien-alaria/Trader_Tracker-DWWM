import { formatAssetImage } from "../../utils/imageHelper.js"

export default function commodityCard({ name, ticker, price, high, low, image } = {}) {

  const finalImage = formatAssetImage(ticker)

  return `
    <div class="card commodity" data-type="commodity" data-ticker="${ticker}">

        <img
          class="card-image"
          src="${finalImage}"
          alt="${ticker}"
        >

        <h2 class="card-title">${name}</h2>

        <p class="card-text">
          Ticker: ${ticker}
        </p>

        <p class="card-text">
          Price: ${price}
        </p>

        <p class="card-text">
          High: ${high}
        </p>

        <p class="card-text">
          Low: ${low}
        </p>

    </div>
  `
}