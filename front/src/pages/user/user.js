import { API_BASE_URL } from "../../config/api.js";
import http from "../../config/instanceHttp.js";
import { decodeToken } from "../../middlewares/roleGuard.js";
import stockCard from "../../components/cards/stockCards.js";
import analystCard from "../../components/cards/analystCard.js";
import { getStock, getForex, getCommodities } from "../../utils/assetsUtils.js";
import updateForm from "../../components/forms/userUpdateForm.js";

// Importation de nos composants et utilitaires externes délégués
import { createCarousel } from "../../components/carousel/carouselComponent.js";
import { createPaginationList } from "../../components/pagination/paginationComponent.js";
import { buildWatchlistData } from "../../utils/assetFormatter.js";

// =====================
// TEMPLATE HTML
// =====================
const userPage = `
<main>
    <h1>User Page</h1>

    <section>
        <div><img id="user_picture" src="" /></div>
        <div id="user_id"></div>
        <div id="user_name"></div>
        <div id="user_email"></div>
    </section>

    <section>
        <h2>My Watchlist</h2>
        <div id="watchlist-carousel-target"></div>

        <h2>Watchlist By List</h2>
        <div id="watchlist-list-target"></div>
    </section>

    <section>
        <h2>Followed Analysts</h2>
        <div id="follow-carousel-target"></div>

        <h2>Followed Analysts By List</h2>
        <div id="follow-list-target"></div>
    </section>

    <section>
        <div class="update-form">
            ${updateForm()}
        </div>
    </section>
</main>
`;
export default userPage;

// Variables globales à la page pour stocker les instances de pagination
let watchlistPaginator = null;
let followPaginator = null;

// =====================
// FONCTION CENTRALE D'INITIALISATION
// =====================
export async function initUser() {
  try {
    const token = localStorage.getItem("token");
    if (!token) return;

    const payload = decodeToken(token);
    if (!payload) {
      window.location.hash = "/login";
      return;
    }

    // Attente de sécurité liée à l'injection asynchrone du routeur
    await new Promise((resolve) => setTimeout(resolve, 0));

    // --------------------------------------------------
    // RÉCUPÉRATION CENTRALISÉE DES DONNÉES
    // --------------------------------------------------
    const [userRes, watchRes, followRes, stocks, forex, commodities] =
      await Promise.all([
        http.get("/users/me"),
        http.get("/users/me/watchlist"),
        http.get("/users/me/follows/users"),
        getStock(),
        getForex(),
        getCommodities(),
      ]);

    const user = userRes.result;
    renderUserInfo(user);

    const allAssets = [...stocks, ...forex, ...commodities];
    const watchlist = buildWatchlistData(watchRes.result, allAssets);
    const followState = followRes.results || [];

    // --------------------------------------------------
    // RENDER DES CARROUSELS (DÉLÉGUÉ AUX COMPOSANTS)
    // --------------------------------------------------
    const renderWatchlistCarousel = (currentData) => {
      createCarousel({
        targetSelector: "#watchlist-carousel-target",
        carouselId: "watchlist-carousel",
        data: currentData,
        cardComponent: stockCard,
        buildUrl: (dataset) =>
          `#/details?type=${dataset.type}&ticker=${dataset.ticker}`,
        onActionClick: async (ticker) => {
          try {
            await http.delete(`/me/follows/${ticker}`);
            const index = watchlist.findIndex((a) => a.ticker === ticker);
            if (index !== -1) {
              watchlist.splice(index, 1);
              renderWatchlistCarousel(watchlist); 
              await watchlistPaginator.load(); 
            }
          } catch (err) {
            console.error("UNFOLLOW ERROR:", err);
          }
        },
      });
    };
    renderWatchlistCarousel(watchlist);

    createCarousel({
      targetSelector: "#follow-carousel-target",
      carouselId: "follow-carousel",
      data: followState,
      cardComponent: analystCard,
      buildUrl: (dataset) => `#/analystdetails?id=${dataset.id}`,
    });

    // --------------------------------------------------
    // RENDER DES PAGINATIONS (DÉLÉGUÉ AUX COMPOSANTS)
    // --------------------------------------------------
    watchlistPaginator = createPaginationList({
      targetSelector: "#watchlist-list-target",
      prefix: "watchlist",
      endpoint: "/users/me/watchlist-paginated",
      itemTemplate: (item) => {
        const defaultLogo = "/assets/logo/nasdaq_logo.png";
        const logoUrl = item.ticker
          ? `/assets/logos/${item.ticker.toLowerCase()}.svg`
          : defaultLogo;

        return `
            <div class="watchlist-item" data-js-clickable data-ticker="${item.ticker}" data-type="${item.asset_type_id || item.type}" style="cursor: pointer; display: flex; align-items: center; gap: 15px; margin-bottom: 8px;">
                <img src="${logoUrl}" style="width: 40px; height: 40px; object-fit: contain;" alt="asset-logo" onerror="this.src='${defaultLogo}'" />
                <p><strong>${item.ticker}</strong> - ${item.name}</p>
            </div>
        `;
      },
      buildUrl: (dataset) =>
        `#/details?type=${dataset.type}&ticker=${dataset.ticker}`,
    });

    followPaginator = createPaginationList({
      targetSelector: "#follow-list-target",
      prefix: "follow",
      endpoint: "/users/me/follows/users",
      itemTemplate: (a) => {
        const defaultAvatar = "/assets/default_analyst.png";
        const avatarUrl = a.picture
          ? `${API_BASE_URL}/uploads/${a.picture}`
          : defaultAvatar;

        return `
            <div class="follow-item" data-js-clickable data-id="${a.id}" style="cursor: pointer; display: flex; align-items: center; gap: 15px; margin-bottom: 8px;">
                <img src="${avatarUrl}" style="width: 40px; height: 40px; border-radius: 50%; object-fit: cover;" alt="analyst-avatar" onerror="this.src='${defaultAvatar}'" />
                <p><strong>${a.name}</strong> - ${a.company ?? "Unknown"}</p>
            </div>
        `;
      },
      buildUrl: (dataset) => `#/analystdetails?id=${dataset.id}`,
    });

    await watchlistPaginator.load();
    await followPaginator.load();

    initLocalUpdateForm(user);
  } catch (err) {
    console.error("USER INIT ERROR:", err);
  }
}

function renderUserInfo(user) {
  document.getElementById("user_id").textContent = `User ID: ${user.id}`;
  document.getElementById("user_name").textContent = `User: ${user.name}`;
  document.getElementById("user_email").textContent = `Email: ${user.email}`;
  const imageEl = document.getElementById("user_picture");
  if (imageEl) {
    imageEl.src = user.picture
      ? `${API_BASE_URL}/uploads/${user.picture}`
      : "/assets/default_analyst.png";
  }
}

function initLocalUpdateForm(user) {
  const form = document.getElementById("user-update-form");
  if (!form) return;

  const nameInput = document.getElementById("user-name");
  const emailInput = document.getElementById("user-email");
  if (nameInput) nameInput.value = user.name ?? "";
  if (emailInput) emailInput.value = user.email ?? "";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    if (!data.get("password")?.trim()) data.delete("password");

    try {
      const result = await http.put("/users/me", data);
      if (result?.token) localStorage.setItem("token", result.token);
      window.location.reload();
    } catch (err) {
      console.error(err);
    }
  });
}