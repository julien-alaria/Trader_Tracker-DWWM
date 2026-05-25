export default function forexCard({ticker, close, high, low, image = 'https://placehold.co/10x10'} = {}) {

  return `

    <div class="card">

        <img
          class="card-image"
          src="${image}"
          alt="${ticker}"
        >

        <h2 class="card-title">${ticker}</h2>

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