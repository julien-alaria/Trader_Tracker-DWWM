import stockService from "../services/stockService.js"

async function getStock(req, res) {
    try {
        const response = await stockService.getAAPLStock()

        res.status(200).json({ message: response })
    } catch (error) {
        console.error("Erreur:", error)

        res.status(500).json({ error: "Failed to fetch stock data" })
    }
}

async function getAllStocks(req, res) {
    try {
        const response = await stockService.getMultipleAggregates()
        console.log(response)
        res.status(200).json({ message: response })
    } catch (error) {
        console.error("Erreur:", error)

        res.status(500).json({ error: "Failed to fetch stock data" })
    }
}

async function getForex(req, res) {
    try {
        const response = await stockService.aggregateForex()
        console.log(response)
        res.status(200).json({ message: response })
    } catch (error) {
        console.error("Erreur:", error)

        res.status(500).json({ error: "Failed to fetch forex data" })
    }
}

async function getCommodities(req, res) {
    try {
        const response = await stockService.aggregateMetals()
        console.log(response)
        res.status(200).json({ message: response })
    } catch (error) {
        console.error("Erreur:", error)

        res.status(500).json({ error: "Failed to fetch forex data" })
    }
}

export default { getStock, getAllStocks, getForex, getCommodities }