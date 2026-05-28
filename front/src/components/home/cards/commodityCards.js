const commodityImages = {
  "C:XAUUSD": "/assets/gold.png",
  "C:XAGUSD": "/assets/silver.png",
  "C:XPTUSD": "/assets/platinum.png",
  "C:COPPERUSD": "/assets/copper.png",
  "C:XPDUSD": "/assets/palladium.png"
}

export default function commodityCard({ name, ticker, price, high, low, image } = {}) {

  const finalImage = image || commodityImages[ticker] || "/assets/default.png"

  return `
    <div class="card commodity" data-type="commidity" data-ticker="${ticker}">

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