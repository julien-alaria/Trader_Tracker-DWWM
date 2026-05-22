import cards from "../../components/cards.js"

const home = `
    <h1>Home</h1>

    <div id="stocks"></div>
`
async function getStock() {

    const url = "http://localhost:3000/stock"

    try {
        const response = await fetch(url)

        if (!response.ok) {
            throw new Error(`Response Status : ${response.status}`)
        }

        const results = await response.json()

        const ticker = results.message.ticker

        return results.message.results.map(({ h, l }) => ({
            ticker,
            h,
            l
        }))

    } catch (error) {
        console.error(error.message)
        return []
    }
}

export async function initHome() {

    const stocks = await getStock()

    document.getElementById("stocks").innerHTML = stocks.map(stock => cards(stock)).join("")
}

export default home