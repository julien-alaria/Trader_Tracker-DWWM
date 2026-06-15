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

  const finalImage = formatAssetImage(ticker);

  return `
    <div class="card stock" data-type="stock" data-ticker="${ticker}">

        <div class="chart" id="tv-${ticker}" data-ticker="${ticker}" data-history='${JSON.stringify(history)}'></div>

        <img class="card-image" src="${finalImage}" alt="${ticker}" onerror="this.onerror=null; this.src='/assets/nasdaq_logo.png'">

        <h2 class="card-title">${name}</h2>

        <p class="card-description">${ticker}</p>

        <p class="card-text">Market Cap: ${marketCap}</p>

        <p class="card-text">Price: ${price}</p>

        <p class="card-text">High: ${high}</p>

        <p class="card-text">Low: ${low}</p>

    </div>
  `
}