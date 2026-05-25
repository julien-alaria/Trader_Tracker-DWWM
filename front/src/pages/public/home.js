import { API_BASE_URL } from "../../config/api.js"
import stockCard from "../../components/stockCards.js"
import forexCard from "../../components/forexCards.js"
import commodityCard from "../../components/commodityCards.js"
import formatForexName from "../../utils/format.js"

const home = `
    <main>
        <h1>Home</h1>
        <div id="stocks"></div>
        <div id="forex"></div>
        <div id="commodities"></div>
    </main>
`

async function getStock() {

    const url = `${API_BASE_URL}/assets/stocks`

    try {
        const response = await fetch(url)

        if (!response.ok) {
            throw new Error(`Response Status : ${response.status}`)
        }

        const results = await response.json()

        return results.message.map(stock => ({
            ticker: stock.ticker,
            name: stock.name,
            marketCap: stock.marketCap,
            price: stock.price,
            high: stock.high,
            low: stock.low
        }))

    } catch (error) {
        console.error(error.message)
        return []
    }
}

async function getForex() {

    const url = `${API_BASE_URL}/assets/forex`

    try {
        const response = await fetch(url)

        if (!response.ok) {
            throw new Error(`Response Status : ${response.status}`)
        }

        const results = await response.json()

        return results.message.map(forex => ({
            ticker: forex.ticker,
            name: formatForexName(forex.ticker),
            high: forex.high,
            low: forex.low,
            close: forex.close,
        }))

    } catch (error) {
        console.error(error.message)
        return []
    }
}

async function getCommodites() {

    const url = `${API_BASE_URL}/assets/commodities`

    try {
        const response = await fetch(url)

        if (!response.ok) {
            throw new Error(`Response Status : ${response.status}`)
        }

        const results = await response.json()

        console.group("Results Commodities", results)

        return results.message.map(commodity => ({
            ticker: commodity.ticker,
            name: commodity.name,
            price: commodity.price,
            high: commodity.high,
            low: commodity.low
        }))

    } catch (error) {
        console.error(error.message)
        return []
    }
}

export async function initHome() {

    const stocks = await getStock()
    const forex = await getForex()
    const commodities = await getCommodites()

    document.getElementById("stocks").innerHTML =
        stocks.map(stock => stockCard(stock)).join("")

    document.getElementById("forex").innerHTML =
        forex.map(pair => forexCard(pair)).join("")

    document.getElementById("commodities").innerHTML =
        commodities.map(item => commodityCard(item)).join("")
}

export default home