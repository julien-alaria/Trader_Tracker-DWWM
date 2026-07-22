import { enableCarouselWindow } from "../../utils/lazyloading.js"

export function createCarousel({ targetSelector, carouselId, data, cardComponent, buildUrl }) {
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
        getData: () => data,
        cardComponent: cardComponent
    })

    carouselEl.addEventListener("click", (e) => {

        const card = e.target.closest(".card")
        if (!card) return

        window.location.hash = buildUrl(card.dataset)
    })
}