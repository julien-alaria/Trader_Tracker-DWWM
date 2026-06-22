const forexImages = {
  'C:EURJPY': "/assets/eur_jpy.webp",
  'C:EURUSD': "/assets/eur_usd.webp",
  'C:EURCHF': "/assets/eur_chf.webp"
}

export default function forexCard({ ticker, name, high, low, close, image } = {}) {

  const finalImage = image || forexImages[ticker] || "/assets/default.png"

  return `
    <div class="card forex" data-type="forex" data-ticker="${ticker}" >

      <img class="card-image" src="${finalImage}" width="259" height="259" alt="${ticker}">

      <h2 class="card-title">${name}</h2>

      <p class="card-text">Ticker: ${ticker}</p>

      <p class="card-text">Price: ${close}</p>

      <p class="card-text">High: ${high}</p>

      <p class="card-text">Low: ${low}</p>

    </div>

  `
}