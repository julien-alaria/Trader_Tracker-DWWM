import { formatMarketCap } from "../../../utils/format.js"

const DEFAULT_IMAGE = "/assets/nasdaq_logo.svg.png"

export default function stockCard({ticker = 'N/A', name = 'Unknown company', marketCap = 0, high = 'N/A', low = 'N/A', image, price = "N/A"} = {}) {

  const formattedMarketCap = formatMarketCap(marketCap)

  const finalImage = image || DEFAULT_IMAGE

  return `
    <div class="card stock" data-type="stock" data-ticker="${ticker}" >

        <div class="chart" id="tv-${ticker}"></div>

        <img
          class="card-image"
          src="${finalImage}"
          alt="${ticker}"
        >

        <h2 class="card-title">${name}</h2>

        <p class="card-description">${ticker}</p>

         <p class="card-text">
          Market Cap: ${marketCap}
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