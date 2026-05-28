import { getStock, getForex, getCommodities } from "../utils/assetsUtils.js"
import stockCard from "../../components/home/cards/stockCards.js"
import forexCard from "../../components/home/cards/forexCards.js"
import commodityCard from "../../components/home/cards/commodityCards.js"
import { createSearchBar, renderResults} from "../utils/searchBarUtils.js"
import { loadTradingViewChart } from "../../utils/tradingChart.js"

const home = `
  <main>
    <h1>Home</h1>

    <div id="stocks"></div>
    <div id="forex"></div>
    <div id="commodities"></div>

  </main>
`
export async function initHome() {
    
    const stocks = await getStock()
    const forex = await getForex()
    const commodities = await getCommodities()

    const allData = [...stocks, ...forex, ...commodities]

    // avoid duplication of search bar
    const oldSearch = document.querySelector(".search-wrapper")
    if (oldSearch) oldSearch.remove()

    const searchBar = createSearchBar((value, container) => {

    const v = value.trim()

    if (!v) {
        container.innerHTML = ""
        return
    }

    const filtered = allData.filter(item =>
        (item.ticker ?? "").toLowerCase().includes(v) ||
        (item.name ?? "").toLowerCase().includes(v)
    )
    // result of search bar
    renderResults(filtered, container, (item) => {
        window.location.hash =`#/details?type=${item.type}&ticker=${item.ticker}`})
    })

    const main = document.querySelector("main")
    const h1 = main.querySelector("h1")

    h1.insertAdjacentElement("afterend", searchBar)

    document.getElementById("stocks").innerHTML =
        stocks.map(stock => stockCard(stock)).join("")

    stocks.forEach(stock => {
        loadTradingViewChart(stock.ticker)
    })

    document.getElementById("forex").innerHTML =
        forex.map(pair => forexCard(pair)).join("")

    document.getElementById("commodities").innerHTML =
        commodities.map(item => commodityCard(item)).join("")

    document.querySelectorAll(".card").forEach(card => {

        card.addEventListener("click", () => {

            const ticker = card.dataset.ticker
            const type = card.dataset.type

            window.location.href = `#/details?type=${type}&ticker=${ticker}`
        })
    })
}

export default home