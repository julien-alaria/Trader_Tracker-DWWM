import { getStock, getForex, getCommodities } from "../../utils/assetsUtils.js"
import { createPaginator } from "../../utils/pagination.js"

const list = `
    <h1>All Assets List</h1>
    <div id="assets-list-container"></div>

    <div id="assets-pagination">
        <button id="assets-prev-btn">Previous</button>
        <button id="assets-next-btn">Next</button>
    </div>
`
export default list

export async function initList() {
    try {
        const [stocks, forex, commodities] = await Promise.all([
            getStock(), getForex(), getCommodities()
        ])
        
        const allAssets = [...stocks, ...forex, ...commodities]
        let currentPage = 0
        const limit = 10

        const updateView = () => {
            const start = currentPage * limit
            const pageData = allAssets.slice(start, start + limit)
            renderAssetList(pageData)
            
            const prevBtn = document.getElementById("assets-prev-btn")
            const nextBtn = document.getElementById("assets-next-btn")
            if(prevBtn) prevBtn.disabled = currentPage === 0
            if(nextBtn) nextBtn.disabled = (start + limit) >= allAssets.length
        }

        const nextBtn = document.getElementById("assets-next-btn")
        const prevBtn = document.getElementById("assets-prev-btn")
        
        if (nextBtn) nextBtn.onclick = () => { currentPage++; updateView() }
        if (prevBtn) prevBtn.onclick = () => { currentPage--; updateView() }

        updateView()

        const container = document.getElementById("assets-list-container")
        container.addEventListener("click", (e) => {
            const item = e.target.closest(".asset-item")
            if (item) {
                window.location.hash = `#/details?type=${item.dataset.type}&ticker=${item.dataset.ticker}`
            }
        })
    } catch (err) {
        console.error("LIST INIT ERROR:", err)
    }
}

function renderAssetList(assets) {
    console.log("ASSETS:", assets)
    const container = document.getElementById("assets-list-container")
    if (!container) return
    container.innerHTML = assets.map(item => `
        <div class="asset-item" data-ticker="${item.ticker}" data-type="${item.type}">
            <img id="logo-list" src="${item.image}" alt="${item.name} logo">
            <span><strong>${item.ticker}</strong></span>
            <span>${item.name}</span>
        </div>
    `).join("")
}