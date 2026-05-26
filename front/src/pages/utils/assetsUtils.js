import http from "../../config/instanceHttp.js"

async function getStock() {

    try {
        const response = await http.get("/assets/stocks")

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

    function formatForexName(ticker) {
        return ticker
            .replace("C:", "")
            .replace(/(.{3})(.{3})/, "$1 / $2")
    }

    try {
        const response = await http.get("/assets/forex")

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

async function getCommodities() {

    try {
        const response = await http.get("/assets/commodities")

        if (!response.ok) {
            throw new Error(`Response Status : ${response.status}`)
        }

        const results = await response.json()

        console.log("Results Commodities", results)

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

export {
    getStock,
    getForex,
    getCommodities
}