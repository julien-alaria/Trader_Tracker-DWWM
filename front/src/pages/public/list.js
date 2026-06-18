import { getStock, getForex, getCommodities } from "../../utils/assetsUtils.js"
import { formatAssetImage } from "../../utils/imageHelper.js"
import { createLocalPaginationList } from "../../components/pagination/paginationComponent.js"

// =====================
// HTML TEMPLATE 
// =====================
const list = `
    <h1>All Assets List</h1>
    <div id="assets-list-target"></div>
`

export default list

// =====================
// STATE GLOBAL
// =====================
let assetsPaginator = null

// =====================
// INIT
// =====================
export async function initList() {
    try {
        // =====================
        // DATA RECOVERY
        // =====================
        const [stocks, forex, commodities] = await Promise.all([
            getStock(), getForex(), getCommodities()
        ])
        
        const allAssets = [...stocks, ...forex, ...commodities];

        // Security expectation related to asynchronous router injection
        await new Promise(resolve => setTimeout(resolve, 0))

        // =====================
        // PAGINATION RENDERING
        // =====================

        // ASSETS PAGINATOR
        assetsPaginator = createLocalPaginationList({
            targetSelector: "#assets-list-target",
            prefix: "assets",
            data: allAssets,
            limit: 10,
            itemTemplate: (item) => {
                const finalImage = formatAssetImage(item.ticker)

                return `
                    <div class="asset-item" data-js-clickable data-ticker="${item.ticker}" data-type="${item.type}" style="cursor: pointer;">
                        <img id="logo-list" 
                             src="${finalImage}" 
                             alt="${item.name} logo" 
                             onerror="this.onerror=null; this.src='/assets/nasdaq_logo.png';">
                        <span><strong>${item.ticker}</strong></span>
                        <span>${item.name}</span>
                    </div>
                `
            },
            buildUrl: (dataset) => `#/details?type=${dataset.type}&ticker=${dataset.ticker}`
        })

        if (assetsPaginator) {
            await assetsPaginator.load()
        }

    } catch (err) {
        console.error("LIST INIT ERROR:", err)
    }
}