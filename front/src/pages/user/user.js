import http from "../../config/instanceHttp.js";
import { decodeToken } from "../../middlewares/roleGuard.js";
import stockCard from "../../components/cards/stockCards.js";
import { getStock, getForex, getCommodities } from "../../utils/assetsUtils.js";
import updateForm from "../../components/user/userUpdateForm.js";
import { enableCarouselWindow } from "../../utils/lazyloading.js";

const userPage = `
<main>
    <h1>User Page</h1>

    <section>
        <div id="user_id"></div>
        <div id="user_name"></div>
        <div id="user_email"></div>
    </section>

    <h2>My Watchlist</h2>
    <div class="carousel" id="watchlist"></div>

    <div class="update-form">
        ${updateForm()}
    </div>
</main>
`;

export default userPage;

export async function initUser() {
    try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const payload = decodeToken(token);
        if (!payload) {
            window.location.hash = "/login";
            return;
        }

        const [userRes, watchRes, stocks, forex, commodities] =
            await Promise.all([
                http.get("/users/me"),
                http.get("/users/me/watchlist"),
                getStock(),
                getForex(),
                getCommodities()
            ]);

        const user = userRes.result;
        renderUserInfo(user);

        const allAssets = [...stocks, ...forex, ...commodities];
        const watchlist = buildWatchlist(watchRes.result, allAssets);

        renderWatchlist(watchlist);
        bindEvents();
        initUpdateForm(user);

    } catch (err) {
        console.error("USER INIT ERROR:", err);
    }
}

function renderWatchlist(watchlist) {
    const container = document.getElementById("watchlist");
    if (!container) return;

    if (!watchlist.length) {
        container.innerHTML = "<p>No favorites yet</p>";
        return;
    }

    const watchlistHTML = watchlist.map(asset => stockCard(asset));

    enableCarouselWindow({
        selector: "#watchlist",
        batchSize: 5,
        getData: () => watchlistHTML
    });
}

function renderUserInfo(user) {
    const idEl = document.getElementById("user_id");
    const nameEl = document.getElementById("user_name");
    const emailEl = document.getElementById("user_email");

    if (idEl) idEl.textContent = `User ID: ${user.id}`;
    if (nameEl) nameEl.textContent = `User Name: ${user.name}`;
    if (emailEl) emailEl.textContent = `Email: ${user.email}`;
}

function buildWatchlist(watchlistRaw, allAssets) {
    return watchlistRaw.map(w => {
        const asset = allAssets.find(a => a.ticker === w.ticker);
        return { ...w, ...asset, isFollowed: true };
    });
}

function bindEvents() {
 document.addEventListener("click", async (e) => {
    if (!e.target.classList.contains("watch-btn")) return;
    e.stopPropagation();

    const card = e.target.closest(".card");
    if (!card) return;

    const ticker = card.dataset.ticker;
    try {
        //API
        await http.delete(`/me/follows/${ticker}`);
        
        card.remove(); 

        //ASSETS CHECKING
        const container = document.getElementById("watchlist");
        if (container && container.children.length === 0) {
            container.innerHTML = "<p>No favorites yet</p>";
        }
    } catch (err) {
        console.error("WATCH ERROR:", err);
    }
});
}

function initUpdateForm(user) {
    const form = document.getElementById("user-update-form");
    if (!form) return;

    const nameInput = document.getElementById("user-name");
    const emailInput = document.getElementById("user-email");

    if (nameInput) nameInput.value = user.name;
    if (emailInput) emailInput.value = user.email;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const data = new FormData(form);
        const payload = { name: data.get("name"), email: data.get("email") };

        const password = data.get("password");
        if (password?.trim()) payload.password = password;

        try {
            const result = await http.put("/users/me", payload);
            if (result.token) {
                localStorage.setItem("token", result.token);
                window.location.hash = "/";
                window.dispatchEvent(new Event("hashchange"));
            }
        } catch (err) {
            console.error("UPDATE ERROR:", err);
        }
    });
}