import { destroyRange } from "./chartManager.js";
import { loadTradingViewChart } from "./tradingChart.js";

export function enableCarouselWindow({ selector = ".carousel", batchSize = 5, getData }) {
  // Observateur global pour le lazy loading
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
      track.innerHTML = getSlice().join("");

      // Attache l'observateur aux conteneurs de graphiques après le rendu
      track.querySelectorAll(".chart").forEach(el => {
        el.classList.add("chart-container");
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

      const oldTickers = getSlice().map(html => html.match(/data-ticker="([^"]+)"/)?.[1]).filter(Boolean);

      track.style.transition = "transform 420ms cubic-bezier(0.22, 1, 0.36, 1)";
      track.style.transform = `translateX(${-direction * 260}px)`;

      setTimeout(() => {
        destroyRange(oldTickers);
        startIndex = next;
        render();
        track.style.transition = "none";
        track.style.transform = "translateX(0)";
      }, 420);
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