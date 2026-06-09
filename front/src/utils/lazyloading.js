import { destroyRange } from "./chartManager.js"
import { loadTradingViewChart } from "./tradingChart.js"

export function enableCarouselWindow({ selector = ".carousel", batchSize = 5, getData, cardComponent }) {
 
  const chartObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target
        const ticker = el.dataset.ticker
        const rawHistory = el.getAttribute('data-history')
        let historyData = []

        if (rawHistory) {
          try { historyData = JSON.parse(rawHistory) } 
          catch (e) { console.error("Erreur JSON.parse", e) }
        }

        loadTradingViewChart(ticker, historyData, true);
        observer.unobserve(el)
      }
    })
  }, { threshold: 0.1 })

  document.querySelectorAll(selector).forEach((carousel) => {
    if (carousel.dataset.bound) return
    carousel.dataset.bound = "true"

    const rawStocks = getData(carousel) 
    if (!rawStocks?.length) return

    let startIndex = 0
    const track = document.createElement("div")
    track.className = "carousel-track"
    carousel.appendChild(track)

   const render = () => {
        track.innerHTML = rawStocks.map(asset => cardComponent(asset)).join("") 
    
        track.querySelectorAll(".chart").forEach(el => {
            const ticker = el.closest(".card")?.dataset.ticker
            if (ticker) {
                el.dataset.ticker = ticker
                chartObserver.observe(el)
            }
        })
    }

    const slide = (direction) => {
        const next = startIndex + direction
        if (next < 0 || next > rawStocks.length - 5) return

        startIndex = next
        const cardWidthWithGap = 260 + 24 
        const offset = startIndex * cardWidthWithGap
        track.style.transform = `translateX(-${offset}px)`
    }

    render()

    carousel.addEventListener("wheel", (e) => {
      e.preventDefault()
      e.stopPropagation()
      const direction = Math.sign(e.deltaY)
      if (direction) slide(direction)
    }, { passive: false })
  })
}