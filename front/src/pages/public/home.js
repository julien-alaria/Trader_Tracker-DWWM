import { getStock, getForex, getCommodities } from "../../utils/assetsUtils.js";
import stockCard from "../../components/cards/stockCards.js";
import forexCard from "../../components/cards/forexCards.js";
import commodityCard from "../../components/cards/commodityCards.js";
import { createSearchBar, renderResults } from "../../components/searchBar/searchBarUtils.js";
import http from "../../config/instanceHttp.js";

const home = `
  <main>
    <h1>Home</h1>

    <div id="search-container"></div>

    <section>
      <h2>Stocks</h2>
      <div id="stocks"></div>
    </section>

    <section>
      <h2>Forex</h2>
      <div id="forex"></div>
    </section>

    <section>
      <h2>Commodities</h2>
      <div id="commodities"></div>
    </section>

  </main>
`;

export default home;

export async function initHome() {
  try {
    // 1. DATA FETCHING
    const [stocks, forex, commodities] = await Promise.all([
      getStock(),
      getForex(),
      getCommodities(),
    ]);

    const allData = [...stocks, ...forex, ...commodities];

    // 2. SEARCH BAR (SAFE INIT)
    const oldSearch = document.querySelector(".search-wrapper");
    if (oldSearch) oldSearch.remove();

    const searchContainer = document.getElementById("search-container");

    const searchBar = createSearchBar((value, container) => {
      const query = value.trim().toLowerCase();

      if (!query) {
        container.innerHTML = "";
        return;
      }

      const filtered = allData.filter(
        (item) =>
          (item.ticker ?? "").toLowerCase().includes(query) ||
          (item.name ?? "").toLowerCase().includes(query),
      );

      renderResults(filtered, container, (item) => {
        window.location.hash = `#/details?type=${item.type}&ticker=${item.ticker}`;
      });
    });

    searchContainer.innerHTML = "";
    searchContainer.appendChild(searchBar);

    // 3. RENDER CARDS
    const stocksContainer = document.getElementById("stocks");
    const forexContainer = document.getElementById("forex");
    const commoditiesContainer = document.getElementById("commodities");

    stocksContainer.innerHTML = stocks.map(stockCard).join("");
    forexContainer.innerHTML = forex.map(forexCard).join("");
    commoditiesContainer.innerHTML = commodities.map(commodityCard).join("");

    // 4. EVENT DELEGATION (CLICK CARDS)
    document.addEventListener("click", (e) => {
      const card = e.target.closest(".card");
      if (!card) return;

      // ignore watch button click
      if (e.target.classList.contains("watch-btn")) return;

      const ticker = card.dataset.ticker;
      const type = card.dataset.type;

      if (!ticker || !type) return;

      window.location.href = `#/details?type=${type}&ticker=${ticker}`;
    });

    // 5. WATCHLIST ACTIONS
    document.addEventListener("click", async (e) => {
      if (!e.target.classList.contains("watch-btn")) return;

      e.stopPropagation();

      const card = e.target.closest(".card");
      if (!card) return;

      const ticker = card.dataset.ticker;
      if (!ticker) return;

      try {
        const isFollowed = card.dataset.followed === "true";

        if (isFollowed) {
          await http.delete("/users/me/follows", { ticker });
          e.target.textContent = "☆ Follow";
          card.dataset.followed = "false";
        } else {
          await http.post("/users/me/follows", { ticker });
          e.target.textContent = "⭐ Unfollow";
          card.dataset.followed = "true";
        }
      } catch (err) {
        console.error("Watchlist error:", err);
      }
    });
  } catch (err) {
    console.error("Home init error:", err);
  }
}
