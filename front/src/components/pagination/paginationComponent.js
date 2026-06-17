import { createPaginator } from "../../utils/pagination.js";

/**
 * Crée une liste paginée asynchrone reliée à une route API back-end
 */
export function createPaginationList({
  targetSelector,
  prefix,
  endpoint,
  itemTemplate,
  buildUrl,
  limit = 5
}) {
  const target = document.querySelector(targetSelector);
  if (!target) return null;

  const containerId = `${prefix}-list-container`;
  const paginationId = `${prefix}-pagination`;
  const prevBtnId = `${prefix}-prev-btn`;
  const nextBtnId = `${prefix}-next-btn`;

  // 1. Injection automatique de la structure HTML requise
  target.innerHTML = `
        <div id="${containerId}"></div>
        <div id="${paginationId}" style="display: none; gap: 10px; margin-top: 10px;">
            <button id="${prevBtnId}">Previous</button>
            <button id="${nextBtnId}">Next</button>
        </div>
    `;

  // 2. Initialisation du paginateur avec l'utilitaire d'origine
  const paginator = createPaginator({
    endpoint: endpoint,
    limit: limit,
    getPayload: () => {
      const token = localStorage.getItem("token");
      // Import dynamique ou décodage local si nécessaire pour le jeton
      return token ? JSON.parse(atob(token.split('.')[1])) : null;
    },
    render: (results) => {
      const container = document.getElementById(containerId);
      if (!container) return;

      if (!results || !results.length) {
        container.innerHTML = "<p class='no-data'>No data available.</p>";
        return;
      }
      container.innerHTML = results.map((item) => itemTemplate(item)).join("");
    },
    mapResponse: (res) => {
      const wrapper = document.getElementById(paginationId);
      if (wrapper) {
        wrapper.style.display = res.results && res.results.length > 0 ? "flex" : "none";
      }
      return { results: res.results, hasNext: res.hasNext };
    },
  });

  // 3. Liaison automatique des événements sur les boutons créés
  const nextBtn = document.getElementById(nextBtnId);
  const prevBtn = document.getElementById(prevBtnId);
  if (nextBtn && prevBtn) {
    paginator.bind({ nextBtn, prevBtn });
  }

  // 4. Gestion unique de la redirection au clic sur une ligne de la liste
  const container = document.getElementById(containerId);
  if (container) {
    container.addEventListener("click", (e) => {
      // Si on clique sur un bouton ou un formulaire d'action, on ne redirige pas !
      if (e.target.closest("button") || e.target.closest("form") || e.target.closest("select") || e.target.closest("input")) {
        return;
      }

      const item = e.target.closest("[data-js-clickable]");
      if (!item) return;
      
      const url = buildUrl(item.dataset);
      if (url) window.location.hash = url;
    });
  }

  return paginator;
}

export function createLocalPaginationList({
  targetSelector,
  prefix,
  data,
  limit = 10,
  itemTemplate,
  buildUrl,
}) {
  const target = document.querySelector(targetSelector);
  if (!target || !data) return null;

  const containerId = `${prefix}-list-container`;
  const paginationId = `${prefix}-pagination`;
  const prevBtnId = `${prefix}-prev-btn`;
  const nextBtnId = `${prefix}-next-btn`;

  // 1. Injection automatique de la structure HTML requise
  target.innerHTML = `
        <div id="${containerId}"></div>
        <div id="${paginationId}" style="display: none; gap: 10px; margin-top: 10px;">
            <button id="${prevBtnId}">Previous</button>
            <button id="${nextBtnId}">Next</button>
        </div>
    `;

  let currentPage = 0;

  const container = document.getElementById(containerId);
  const paginationDiv = document.getElementById(paginationId);
  const prevBtn = document.getElementById(prevBtnId);
  const nextBtn = document.getElementById(nextBtnId);

  // 2. Fonction de rafraîchissement de la vue locale (Slice)
  const updateView = () => {
    const start = currentPage * limit;
    const pageData = data.slice(start, start + limit);

    if (!pageData.length) {
      container.innerHTML = "<p class='no-data'>No data available</p>";
      if (paginationDiv) paginationDiv.style.display = "none";
      return;
    }

    container.innerHTML = pageData.map((item) => itemTemplate(item)).join("");

    if (prevBtn) prevBtn.disabled = currentPage === 0;
    if (nextBtn) nextBtn.disabled = start + limit >= data.length;

    if (paginationDiv) {
      paginationDiv.style.display = data.length > limit ? "flex" : "none";
    }
  };

  // 3. Liaison des clics boutons
  if (nextBtn) nextBtn.onclick = () => { currentPage++; updateView(); };
  if (prevBtn) prevBtn.onclick = () => { currentPage--; updateView(); };

  // 4. Gestion unique de la redirection au clic
  if (container) {
    container.addEventListener("click", (e) => {
      if (e.target.closest("button")) return;

      const item = e.target.closest("[data-js-clickable]");
      if (!item) return;
      
      const url = buildUrl(item.dataset);
      if (url) window.location.hash = url;
    });
  }

  return {
    load: async () => {
      updateView();
    }
  };
}