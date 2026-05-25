export default function stockCard({ticker = 'N/A', name = 'Unknown company', marketCap = 0, high = 'N/A', low = 'N/A', image = 'https://placehold.co/10x10', price = "N/A"} = {}) {

  const formattedMarketCap =
    new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 2
    }).format(marketCap)

  return `
    <div class="card">

        <img
          class="card-image"
          src="${image}"
          alt="${ticker}"
        >

        <h2 class="card-title">${name}</h2>

        <p class="card-description">${ticker}</p>

         <p class="card-text">
          Price: ${marketCap}
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