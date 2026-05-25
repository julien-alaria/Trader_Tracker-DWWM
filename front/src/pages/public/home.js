import { API_BASE_URL } from "../../config/api.js"
import card from "../../components/cards.js"

const home = `
    <h1>Home</h1>
    <div id="stocks"></div>
`

async function getStock() {

    const url = `${API_BASE_URL}/stock`

    try {
        const response = await fetch(url)

        if (!response.ok) {
            throw new Error(`Response Status : ${response.status}`)
        }

        const results = await response.json()

        return results.message.map(stock => ({
            ticker: stock.ticker,
            name: stock.name,
            marketCap: stock.market_cap,
            price: stock.price,
            high: stock.high,
            low: stock.low
        }))

    } catch (error) {
        console.error(error.message)
        return []
    }
}

export async function initHome() {

    const stocks = await getStock()

    document.getElementById("stocks").innerHTML =
        stocks.map(stock => card(stock)).join("")
}

export default home