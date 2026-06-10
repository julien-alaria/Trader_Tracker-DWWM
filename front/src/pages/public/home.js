import { getStock, getForex, getCommodities } from "../../utils/assetsUtils.js"
import { createSearchBar, renderResults } from "../../components/searchBar/searchBarUtils.js"
import { enableCarouselWindow } from "../../utils/lazyloading.js"
import stockCard from "../../components/cards/stockCards.js"
import forexCard from "../../components/cards/forexCards.js"
import commodityCard from "../../components/cards/commodityCards.js"

const home = `
    <section id="home-top">
        <h1 id="home-top-title">TRADER TRACKER</h1>

        <p id="home-top-text">
            Track your investments with ease
        </p>

        <a id="home-top-register" href="#/register">CREATE FREE ACCOUNT</a>
    </section>

    <section id="home-search-bar"> 
        <h2 id="search-bar-text">FIND YOUR ASSET</h2>
        <div id="search-container"></div>
    </section> 

    <section id="home-stocks">
        <h2 id="home-stocks-title">NASDAQ</h2>

        <p id="home-stocks-text">Nasdaq is a US stock market for new companies with high growth potential, particularly in the high-tech sector.</p>

        <div class="carousel" id="stocks"></div>
    </section>

    <section id="home-forex">
        <h2 id="home-forex-title">Forex</h2>

        <p id="home-stocks-text">Foreign exchange market where currencies from all over the world are traded</p>

        <div class="carousel" id="forex"></div>
    </section>

    <section id="home-middle">
        <p id="home-middle-text">
           Take control of your investments today
        </p>

        <a id="home-top-register" href="#/register">CREATE FREE ACCOUNT</a>
    </section>

    <section id="home-commodities">
        <h2 id="home-commodities-title">Comex</h2>

        <p id="home-commodities-text">The largest exchange for metals futures contracts</p>

        <div class="carousel" id="commodities"></div>
    </section>
`

export default home

document.addEventListener("click", (e) => {
    const card = e.target.closest(".card")
    if (card && card.dataset.ticker && card.dataset.type) {
        window.location.hash = `#/details?type=${card.dataset.type}&ticker=${card.dataset.ticker}`
    }
})

export async function initHome() {
    try {
        //DATA FETCHING
        const [stocks, forex, commodities] = await Promise.all([
            getStock(),
            getForex(),
            getCommodities(),
        ])

        const allData = [...stocks, ...forex, ...commodities]

        //SEARCH BAR
        const searchContainer = document.getElementById("search-container")
        const searchBar = createSearchBar((value, container) => {
            const query = value.trim().toLowerCase()
            if (!query) { container.innerHTML = ""
                return }

            const filtered = allData.filter(item =>
                (item.ticker ?? "").toLowerCase().includes(query) ||
                (item.name ?? "").toLowerCase().includes(query)
            )

            const limitedResults = filtered.slice(0, 5)

            renderResults(limitedResults, container, (item) => {
                window.location.hash = `#/details?type=${item.type}&ticker=${item.ticker}`
            })
        })

        searchContainer.innerHTML = ""
        searchContainer.appendChild(searchBar)

        //BUILD CAROUSELS
        enableCarouselWindow({ 
            selector: "#stocks", 
            batchSize: 5, 
            getData: () => stocks, 
            cardComponent: stockCard 
        })

        enableCarouselWindow({ 
            selector: "#forex", 
            batchSize: 5, 
            getData: () => forex, 
            cardComponent: forexCard
        })

        enableCarouselWindow({ 
            selector: "#commodities", 
            batchSize: 3, 
            getData: () => commodities, 
            cardComponent: commodityCard
        })

    } catch (err) {
        console.log("%c--- DIAGNOSTIC ERROR ---", "color: lighblue font-weight: bold")
        console.error("ERROR :", err)
        console.dir(err)
    }
}