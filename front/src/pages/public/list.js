import { getStock, getForex, getCommodities } from "../../utils/assetsUtils.js"
import { formatAssetImage } from "../../utils/imageHelper.js"

// =====================
// TEMPLATE
// =====================
const list = `
    <h1>All Assets List</h1>
    <div id="assets-list-container"></div>

    <div id="assets-pagination" style="display: none;">
        <button id="assets-prev-btn">Previous</button>
        <button id="assets-next-btn">Next</button>
    </div>
`
export default list

// =====================
// INIT (TOTALEMENT AUTONOME)
// =====================
export async function initList() {
    try {
        // 1. DATA FETCHING UNIQUE
        const [stocks, forex, commodities] = await Promise.all([
            getStock(), getForex(), getCommodities()
        ])
        
        const allAssets = [...stocks, ...forex, ...commodities]

        // 2. TIMING SÉCURITÉ DOM
        await new Promise(resolve => setTimeout(resolve, 0))

        const container = document.getElementById("assets-list-container")
        const paginationDiv = document.getElementById("assets-pagination")
        const nextBtn = document.getElementById("assets-next-btn")
        const prevBtn = document.getElementById("assets-prev-btn")

        if (!container) return

        // 3. ÉTAT LOCAL DE PAGINATION (Réinitialisé à CHAQUE chargement de page)
        let currentPage = 0
        const limit = 10

        const updateView = () => {
            const start = currentPage * limit
            const pageData = allAssets.slice(start, start + limit)
            
            // Rendu des items de la page en cours
            renderAssetList(container, pageData)
            
            // Mise à jour des boutons de navigation
            if (prevBtn) prevBtn.disabled = currentPage === 0
            if (nextBtn) nextBtn.disabled = (start + limit) >= allAssets.length
            
            // Affichage du bloc de pagination si nécessaire
            if (paginationDiv) {
                paginationDiv.style.display = allAssets.length > limit ? "flex" : "none"
            }
        }

        // Attachement des clics de pagination nettoyés à chaque init
        if (nextBtn) nextBtn.onclick = () => { currentPage++; updateView() }
        if (prevBtn) prevBtn.onclick = () => { currentPage--; updateView() }

        // Premier affichage
        updateView()

        // 4. DÉLÉGATION D'ÉVÉNEMENT UNIQUE SUR LE CONTENEUR
        container.onclick = (e) => {
            const item = e.target.closest(".asset-item")
            if (item) {
                window.location.hash = `#/details?type=${item.dataset.type}&ticker=${item.dataset.ticker}`
            }
        }

    } catch (err) {
        console.error("LIST INIT ERROR:", err)
    }
}

// =====================
// RENDER COMPOSANT
// =====================
function renderAssetList(targetContainer, assets) {
    if (!assets.length) {
        targetContainer.innerHTML = "<p>No assets available</p>"
        return
    }

    targetContainer.innerHTML = assets.map(item => {
      
        const finalImage = formatAssetImage(item.ticker)

        return `
            <div class="asset-item" data-ticker="${item.ticker}" data-type="${item.type}" style="cursor: pointer;">
                <img id="logo-list" 
                     src="${finalImage}" 
                     alt="${item.name} logo" 
                     onerror="this.onerror=null; this.src='/assets/nasdaq_logo.png';">
                <span><strong>${item.ticker}</strong></span>
                <span>${item.name}</span>
            </div>
        `
    }).join("")
}