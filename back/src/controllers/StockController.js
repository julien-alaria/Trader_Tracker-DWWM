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

// Light datas for Home.js
async function getHomeStocks(req, res) {
    try {
        const response = await stockService.getMultipleAggregatesJsonLight();
        res.status(200).json({ message: response });
    } catch (error) {
        console.error("Erreur Home Stocks:", error);
        res.status(500).json({ message: "Failed to fetch home stocks" });
    }
}
// Light datas for Home.js
async function getHomeForex(req, res) {
    try {
        const response = await stockService.aggregateForexJsonLight();
        res.status(200).json({ message: response });
    } catch (error) {
        console.error("Erreur Home Forex:", error);
        res.status(500).json({ message: "Failed to fetch home forex" });
    }
}
// Light datas for Home.js
async function getHomeCommodities(req, res) {
    try {
        const response = await stockService.aggregateMetalsJsonLight();
        res.status(200).json({ message: response });
    } catch (error) {
        console.error("Erreur Home Commodities:", error);
        res.status(500).json({ message: "Failed to fetch home commodities" });
    }
}

// Light datas for list.js
async function getBriefStocks(req, res) {
    try {
        const response = await stockService.getBriefStocksJson();
        res.status(200).json({ message: response });
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
}

async function getBriefForex(req, res) {
    try {
        const response = await stockService.getBriefForexJson();
        res.status(200).json({ message: response });
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
}

async function getBriefCommodities(req, res) {
    try {
        const response = await stockService.getBriefCommoditiesJson();
        res.status(200).json({ message: response });
    } catch (error) {
        res.status(500).json({ message: "Error" });
    }
}

export default { 
    getStock, 
    getAllStocks, 
    getForex, 
    getCommodities,
    getHomeStocks,
    getHomeForex,
    getHomeCommodities,
    getBriefStocks,
    getBriefForex,
    getBriefCommodities
}
