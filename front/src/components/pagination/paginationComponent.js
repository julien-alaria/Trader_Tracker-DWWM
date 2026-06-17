import { createPaginator } from "../../utils/pagination.js"

export function createPaginationList({ targetSelector, prefix, endpoint, itemTemplate, buildUrl }) {

    const target = document.querySelector(targetSelector)
    if (!target) return null

    const containerId = `${prefix}-list-container`
    const paginationId = `${prefix}-pagination`
    const prevBtnId = `${prefix}-prev-btn`
    const nextBtnId = `${prefix}-next-btn`

    target.innerHTML = `
        <div id="${containerId}"></div>
        <div id="${paginationId}" style="display: none; gap: 10px; margin-top: 10px;">
            <button id="${prevBtnId}">Previous</button>
            <button id="${nextBtnId}">Next</button>
        </div>
    `

    const paginator = createPaginator({
        endpoint: endpoint,
        limit: 5,
        render: (results) => {
            const container = document.getElementById(containerId);
            if (!container) return

            container.innerHTML = results.map(item => itemTemplate(item)).join("")
        },
        mapResponse: (res) => {
            const wrapper = document.getElementById(paginationId)
            if (wrapper) {
                wrapper.style.display = (res.results && res.results.length > 0) ? "flex" : "none"
            }
            return { results: res.results, hasNext: res.hasNext }
        }
    });

    const nextBtn = document.getElementById(nextBtnId)
    const prevBtn = document.getElementById(prevBtnId)
    if (nextBtn && prevBtn) {
        paginator.bind({ nextBtn, prevBtn })
    }

    const container = document.getElementById(containerId)
    container.addEventListener("click", (e) => {
        const item = e.target.closest("[data-js-clickable]")
        if (!item) return;
        window.location.hash = buildUrl(item.dataset)
    });

    return paginator
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

  // 1. Injection automatique de la structure HTML requise (Exactement comme ton autre composant)
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

  // 2. Fonction de mise à jour interne de la vue (Logique de slice d'origine encapsulée)
  const updateView = () => {
    const start = currentPage * limit;
    const pageData = data.slice(start, start + limit);

    if (!pageData.length) {
      container.innerHTML = "<p>No assets available</p>";
      if (paginationDiv) paginationDiv.style.display = "none";
      return;
    }

    // Le composant s'occupe d'effectuer la boucle sur le tableau de résultats
    container.innerHTML = pageData.map((item) => itemTemplate(item)).join("");

    // Mise à jour des boutons de navigation
    if (prevBtn) prevBtn.disabled = currentPage === 0;
    if (nextBtn) nextBtn.disabled = start + limit >= data.length;

    // Visibilité du bloc de pagination
    if (paginationDiv) {
      paginationDiv.style.display = data.length > limit ? "flex" : "none";
    }
  };

  // 3. Liaison automatique des événements sur les boutons créés
  if (nextBtn) nextBtn.onclick = () => { currentPage++; updateView(); };
  if (prevBtn) prevBtn.onclick = () => { currentPage--; updateView(); };

  // 4. Gestion unique de la redirection au clic (Délégation d'événements)
  container.addEventListener("click", (e) => {
    const item = e.target.closest("[data-js-clickable]");
    if (!item) return;
    window.location.hash = buildUrl(item.dataset);
  });

  // Retourne un objet avec une méthode load pour harmoniser l'init avec tes autres pages
  return {
    load: async () => {
      updateView();
    }
  };
}