import { enableCarouselWindow } from "../../utils/lazyloading.js"

export function initCarousel(containerId, data, cardComponent, buildUrl) {

    const container = document.getElementById(containerId)
    if (!container) return;

    if (!data || data.length === 0) {
        container.innerHTML = "<p>Aucune donnée disponible</p>";
        return;
    }

    // LazyLoading
    enableCarouselWindow({
        selector: `#${containerId}`,
        batchSize: 5,
        getData: () => data,
        cardComponent: cardComponent
    });

    container.addEventListener("click", (e) => {
       
        if (e.target.closest(".watch-btn")) return;

        const card = e.target.closest(".stock-card") || e.target.closest(".card") || e.target.closest(".analyst");
        if (!card) return;

        window.location.hash = buildUrl(card.dataset);
    })
}