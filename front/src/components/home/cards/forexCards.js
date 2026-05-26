export default function forexCard({ ticker, name, high, low, close, image = 'https://placehold.co/300x180'} = {}) {

  return `
    <div class="card">

        <img
          class="card-image"
          src="${image}"
          alt="${ticker}"
        >

        <h2 class="card-title">${name}</h2>

        <p class="card-text">
          Ticker: ${ticker}
        </p>

        <p class="card-text">
          Price: ${close}
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