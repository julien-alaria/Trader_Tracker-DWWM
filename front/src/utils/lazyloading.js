import { destroyRange } from "./chartManager.js";
import { loadTradingViewChart } from "./tradingChart.js";

export function enableCarouselWindow({ selector = ".carousel", batchSize = 5, getData }) {
 
  const chartObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const ticker = entry.target.dataset.ticker;
        loadTradingViewChart(ticker);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll(selector).forEach((carousel) => {
    if (carousel.dataset.bound) return;
    carousel.dataset.bound = "true";

    const data = getData(carousel);
    if (!data?.length) return;

    let startIndex = 0;
    const track = document.createElement("div");
    track.className = "carousel-track";
    carousel.appendChild(track);

    const getSlice = () => data.slice(startIndex, startIndex + batchSize);

    const render = () => {
        track.innerHTML = data.join(""); 
    
        track.querySelectorAll(".chart").forEach(el => {
            const ticker = el.closest(".card")?.dataset.ticker;
            if (ticker) {
                el.dataset.ticker = ticker;
                chartObserver.observe(el);
            }
        });
    };

    const slide = (direction) => {
        const next = startIndex + direction;

        if (next < 0 || next > data.length - batchSize) return;

        startIndex = next;
        
        // 260px (largeur carte) + 24px (gap)
        const cardWidthWithGap = 260 + 24; 
        const offset = startIndex * cardWidthWithGap;
        
        track.style.transform = `translateX(-${offset}px)`;
    };

    render();

    carousel.addEventListener("wheel", (e) => {
      e.preventDefault();
      e.stopPropagation();
      const direction = Math.sign(e.deltaY);
      if (direction) slide(direction);
    }, { passive: false });
  });
}