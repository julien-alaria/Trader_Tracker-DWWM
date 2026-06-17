import stockService from "../services/stockService.js"

async function getStock(req, res) {
    try {
        const response = await stockService.getAAPLStock()

        res.status(200).json({ message: response })
    } catch (error) {
        console.error("Erreur:", error)

        res.status(500).json({ message: "Failed to fetch stock data" })
    }
}

async function getAllStocks(req, res) {
    try {
        const response = await stockService.getMultipleAggregatesJson()
        
        res.status(200).json({ message: response })
    } catch (error) {
        console.error("Erreur:", error)

        res.status(500).json({ message: "Failed to fetch stock data" })
    }
}

async function getForex(req, res) {
    try {
        const response = await stockService.aggregateForexJson()
        res.status(200).json({ message: response })
    } catch (error) {
        console.error("Erreur:", error)

        res.status(500).json({ message: "Failed to fetch forex data" })
    }
}

async function getCommodities(req, res) {
    try {
        const response = await stockService.aggregateMetalsJson()
        res.status(200).json({ message: response })
    } catch (error) {
        console.error("Erreur:", error)

        res.status(500).json({ message: "Failed to fetch forex data" })
    }
}

export default { getStock, getAllStocks, getForex, getCommodities }