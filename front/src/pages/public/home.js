import { getStock, getForex, getCommodities } from "../../utils/assetsUtils.js"
import stockCard from "../../components/cards/stockCards.js"
import forexCard from "../../components/cards/forexCards.js"
import commodityCard from "../../components/cards/commodityCards.js"
import { createSearchBar, renderResults } from "../../components/searchBar/searchBarUtils.js"
import { enableCarouselWindow } from "../../utils/lazyloading.js"

const home = `
  <main>
    <h1>Home</h1>
    <div id="search-container"></div>
    <section><h2>Stocks</h2><div class="carousel" id="stocks"></div></section>
    <section><h2>Forex</h2><div class="carousel" id="forex"></div></section>
    <section><h2>Commodities</h2><div class="carousel" id="commodities"></div></section>
  </main>
`

export default home

document.addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    if (card && card.dataset.ticker && card.dataset.type) {
        window.location.hash = `#/details?type=${card.dataset.type}&ticker=${card.dataset.ticker}`;
    }
});

export async function initHome() {
    try {
        //DATA FETCHING
        const [stocks, forex, commodities] = await Promise.all([
            getStock(),
            getForex(),
            getCommodities(),
        ]);

        const allData = [...stocks, ...forex, ...commodities];

        //SEARCH BAR
        const searchContainer = document.getElementById("search-container");
        const searchBar = createSearchBar((value, container) => {
            const query = value.trim().toLowerCase();
            if (!query) { container.innerHTML = ""; return; }

            const filtered = allData.filter(item =>
                (item.ticker ?? "").toLowerCase().includes(query) ||
                (item.name ?? "").toLowerCase().includes(query)
            );

            const limitedResults = filtered.slice(0, 5);

            renderResults(limitedResults, container, (item) => {
                window.location.hash = `#/details?type=${item.type}&ticker=${item.ticker}`;
            });
        });

        searchContainer.innerHTML = "";
        searchContainer.appendChild(searchBar);

        //BUILD CAROUSELS
        enableCarouselWindow({ selector: "#stocks", batchSize: 5, getData: () => stocks.map(stockCard) });
        enableCarouselWindow({ selector: "#forex", batchSize: 5, getData: () => forex.map(forexCard) });
        enableCarouselWindow({ selector: "#commodities", batchSize: 5, getData: () => commodities.map(commodityCard) });

    } catch (err) {
        console.error("Erreur lors de l'initialisation de la home:", err);
        alert("Problème de chargement des actifs.");
    }
}