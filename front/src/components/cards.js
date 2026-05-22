export default function cards({ticker, description, h, l}) {
    console.log(ticker)
    console.log(description)
    console.log(h)
    console.log(l)

    return `
    <div class="card">
        <img class="card-image" src="stockPic" alt="stockpicture">
        <h2 class="card-title">${ticker}</h2>
        <p class="card-description">${description}</p>
        <p class="card-text">High: ${h}</p>
        <p class="card-text">Low: ${l}</p>
    </div>
    `
}