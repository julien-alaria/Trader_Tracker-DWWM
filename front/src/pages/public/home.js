import { getStock, getForex, getCommodities} from "../utils/assetsUtils.js"
import stockCard from "../../components/home/cards/stockCards.js"
import forexCard from "../../components/home/cards/forexCards.js"
import commodityCard from "../../components/home/cards/commodityCards.js"
import renderResults from "../../components/renderResults.js"
import createSearchBar from "../../components/searchBar.js"

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

  const searchBar = createSearchBar((value, container) => {

    const filtered = allData.filter(item =>
        item.ticker.toLowerCase().includes(value) ||
        item.name?.toLowerCase().includes(value)
    )

    if (!value) {
    container.innerHTML = ""
    return
    }

    renderResults(filtered, container)

    })

    document.querySelector("main").prepend(searchBar)

    document.getElementById("stocks").innerHTML =
        stocks.map(stock => stockCard(stock)).join("")

    document.getElementById("forex").innerHTML =
        forex.map(pair => forexCard(pair)).join("")

    document.getElementById("commodities").innerHTML =
        commodities.map(item => commodityCard(item)).join("")
}

export default home