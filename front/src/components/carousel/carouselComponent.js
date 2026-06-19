import { enableCarouselWindow } from "../../utils/lazyloading.js"

export function createCarousel({ targetSelector, carouselId, data, cardComponent, buildUrl, onActionClick }) {
    const target = document.querySelector(targetSelector)
    if (!target) return

    if (!data || data.length === 0) {
        target.innerHTML = "<p>No data available</p>"
        return
    }

    target.innerHTML = ""

    // "data-bound"
    const carouselEl = document.createElement("div")
    carouselEl.className = "carousel"
    carouselEl.id = carouselId
    target.appendChild(carouselEl)

    enableCarouselWindow({
        selector: `#${carouselId}`,
        batchSize: 5,
        getData: () => data,
        cardComponent: cardComponent
    });

    carouselEl.addEventListener("click", (e) => {
        const actionBtn = e.target.closest(".watch-btn") || e.target.closest(".unfollow-btn")
        if (actionBtn && onActionClick) {
            const card = actionBtn.closest(".stock-card") || actionBtn.closest(".card")
            if (card) onActionClick(card.dataset.ticker)
            return
        }

        const card = e.target.closest(".stock-card") || e.target.closest(".card")
        if (!card) return

        window.location.hash = buildUrl(card.dataset)
    })
}