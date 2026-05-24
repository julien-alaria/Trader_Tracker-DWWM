export default function cards({ ticker = "N/A", description = "", h = 0, l = 0 } = {}) {
    return `
    <div class="card">
        <img class="card-image" src="stockPic" alt="stockpicture">

        <h2 class="card-title">${ticker}</h2>
        <p class="card-description">${description}</p>

        <p class="card-text">High: ${h}</p>
        <p class="card-text">Low: ${l}</p>
    </div>
    `;
}