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

export default { getStock }