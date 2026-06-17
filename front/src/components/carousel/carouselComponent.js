import { enableCarouselWindow } from "../../utils/lazyloading.js";

/**
 * Génère et initialise un carrousel réutilisable
 * @param {string} targetSelector - ID ou sélecteur HTML où injecter le carrousel (ex: "#watchlist-carousel-target")
 * @param {string} carouselId - ID unique à donner au sous-conteneur du carrousel (ex: "watchlist-carousel")
 * @param {Array} data - Tableau de données brutes à injecter
 * @param {Function} cardComponent - Composant de carte HTML (ex: stockCard, analystCard)
 * @param {Function} buildUrl - Callback générant l'URL de redirection au clic (ex: (dataset) => `#/details?type=...`)
 * @param {Function} [onActionClick] - Optionnel : Callback en cas de clic sur un bouton d'action interne (ex: Unfollow)
 */
export function createCarousel({
  targetSelector,
  carouselId,
  data,
  cardComponent,
  buildUrl,
  onActionClick = null
}) {
  const target = document.querySelector(targetSelector);
  if (!target) return;

  // Injection de la structure de base du carrousel
  target.innerHTML = `<div class="carousel" id="${carouselId}"></div>`;

  if (!data || !data.length) {
    const container = document.getElementById(carouselId);
    if (container) container.innerHTML = "<p class='no-data'>No items available.</p>";
    return;
  }

  // Initialisation du moteur de lazyloading / fenêtre glissante
  enableCarouselWindow({
    selector: `#${carouselId}`,
    batchSize: 5,
    getData: () => data,
    cardComponent: cardComponent
  });

  const container = document.getElementById(carouselId);
  if (!container) return;

  // Gestion unique des clics par délégation
  container.onclick = (e) => {
    // Cas spécifique : Clic sur un bouton d'action métier (ex: bouton Unfollow rouge sur une carte)
    if (e.target.classList.contains("unfollow-btn") || e.target.closest(".action-btn")) {
      if (onActionClick) {
        const ticker = e.target.dataset.ticker || e.target.closest("[data-ticker]")?.dataset.ticker;
        onActionClick(ticker);
      }
      return;
    }

    // Cas général : Redirection au clic sur la carte
    const card = e.target.closest(".stock-card") || e.target.closest(".analyst") || e.target.closest(".card");
    if (card) {
      window.location.hash = buildUrl(card.dataset);
    }
  };
}