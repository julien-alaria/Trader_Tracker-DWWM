import { loadMiniChart } from "./tradingChart.js"

export function enableCarouselWindow({ selector = ".carousel", getData, cardComponent }) {
 
  const chartObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target
        
        if (el.dataset.initialized === "true") return
        
        const ticker = el.dataset.ticker
        const historyJson = el.dataset.history

        if (ticker && historyJson) {
            try {
                const historyData = JSON.parse(historyJson)
                
                loadMiniChart(ticker, historyData)
                
                el.dataset.initialized = "true"
                observer.unobserve(el)
            } catch (e) {
                console.error("Parsing history error for", ticker, e)
            }
        }
      }
    })
  }, { threshold: 0.1 })

  const carousel = document.querySelector(selector)
  if (!carousel || carousel.dataset.bound === "true") return
  carousel.dataset.bound = "true"

  const allAssets = getData(carousel) 
  if (!allAssets?.length) return

  const isFixed = allAssets.length <= 2
  const displayAssets = isFixed ? allAssets : [...allAssets].sort(() => 0.5 - Math.random()).slice(0, 30)

  carousel.innerHTML = ""
  const track = document.createElement("div")
  track.className = "carousel-track"
  track.style.transform = "translateX(0px)"
  track.style.transition = "none"
  
  if (isFixed) {
      track.style.justifyContent = "center"
  }
  
  carousel.appendChild(track)

  const render = () => {
    track.innerHTML = displayAssets.map(asset => cardComponent(asset)).join("") 
  
    track.querySelectorAll(".chart").forEach(el => {
        const cardParent = el.closest("[data-ticker]")
        const ticker = cardParent?.dataset.ticker
      
        if (ticker) {
            el.dataset.ticker = ticker
            chartObserver.observe(el)
        }
    })
  }

  render()

  // on small list no scroll
  if (isFixed) return

  // infinite scroll for wide lists
 const getCardWidth = () => {
    const firstCard = track.firstElementChild;
    if (!firstCard) return 324; // Fallback par défaut (300 + 24)
    const style = window.getComputedStyle(firstCard);
    return firstCard.offsetWidth + parseInt(style.marginRight || 0) + parseInt(style.marginLeft || 0);
  };

  let currentX = 0;
  let targetX = 0;
  const ease = 0.08;
  let isReorganizing = false;
  let cardWidth = getCardWidth(); // Calculé au chargement

  // Recalcule si l'utilisateur redimensionne la fenêtre
  window.addEventListener('resize', () => { cardWidth = getCardWidth(); });

  const updateLoop = () => {
    if (isReorganizing) { requestAnimationFrame(updateLoop); return; }
    
    const distance = targetX - currentX;
    if (Math.abs(distance) > 0.05) {
      currentX += distance * ease;
      
      // On utilise cardWidth (dynamique) au lieu de CARD_WIDTH (fixe)
      if (currentX >= cardWidth || currentX <= 0) {
        isReorganizing = true;
        
        if (currentX >= cardWidth) {
          const firstCard = track.firstElementChild;
          if (firstCard) {
            track.appendChild(firstCard);
            currentX -= cardWidth;
            targetX -= cardWidth;
            
            const chartEl = firstCard.querySelector(".chart");
            if (chartEl && !chartEl.dataset.initialized) {
                setTimeout(() => chartObserver.observe(chartEl), 0);
            }
          }
        } else {
          const lastCard = track.lastElementChild;
          if (lastCard) {
            track.insertBefore(lastCard, track.firstElementChild);
            currentX += cardWidth;
            targetX += cardWidth;
            
            const chartEl = lastCard.querySelector(".chart");
            if (chartEl && !chartEl.dataset.initialized) {
                setTimeout(() => chartObserver.observe(chartEl), 0);
            }
          }
        }
        requestAnimationFrame(() => { isReorganizing = false; });
      }
      track.style.transform = `translateX(${-currentX}px)`;
    }
    requestAnimationFrame(updateLoop);
  }

  requestAnimationFrame(updateLoop)

  carousel.addEventListener("wheel", (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!e.deltaY) return
    targetX += e.deltaY * 1.2
  }, { passive: false })
}