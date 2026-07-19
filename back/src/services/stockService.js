import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const dataPath = path.join(__dirname, '../data')

async function readJsonFile(fileName) {
  const filePath = path.join(dataPath, fileName)
  const data = await fs.readFile(filePath, 'utf-8')

  return JSON.parse(data)
}

// ==========================================
// functions for LOCAL JSON
// ==========================================

// ==========================================
// FUNCTIONS WITH FULL DATA FOR CHARTS ON assetDetails.js
// ==========================================

async function getMultipleAggregatesJson() {
  const stocks = await readJsonFile('nasdaq.json')

  return stocks.map((stock) => ({
    type: "nasdaq",
    ticker: stock.ticker,
    name: stock.name,
    marketCap: stock.marketCap,
    price: stock.price ?? null,
    high: stock.high ?? null,
    low: stock.low ?? null,
    image: stock.image || "/assets/nasdaq_logo.webp",
    history: stock.history || []
  }));
}

async function aggregateForexJson() {

  const forex = await readJsonFile('forex.json')

  return forex.map((agg) => ({
    type: "forex",
    ticker: agg.ticker,
    open: agg.open,
    high: agg.high,
    low: agg.low,
    close: agg.close,
    volume: agg.volume,
    timestamp: agg.timestamp
  }))
}

async function aggregateMetalsJson() {

  const commodities = await readJsonFile('commodities.json')

  return commodities.map((agg) => ({
    type: "commodity",
    ticker: agg.ticker,
    name: agg.name,
    price: agg.price ?? null,
    high: agg.high ?? null,
    low: agg.low ?? null,
    open: agg.open ?? null,
    close: agg.close ?? null
  }))
}

// ==========================================
// FUNCTIONS WITH LIGHT DATA FOR CHARTS ON home.js
// ==========================================

async function getMultipleAggregatesJsonLight() {
    const stocks = await readJsonFile('nasdaq.json')
   
    return stocks.map((stock) => ({
        type: "nasdaq",
        ticker: stock.ticker,
        name: stock.name,
        marketCap: stock.marketCap,
        price: stock.price ?? null,
        high: stock.high ?? null,
        low: stock.low ?? null,
        image: stock.image || "/assets/nasdaq_logo.webp",
        history: Array.isArray(stock.history) ? stock.history.slice(-15) : []
    }))
}

async function aggregateForexJsonLight() {
    const forex = await readJsonFile('forex.json')
    return forex.map((agg) => ({
        type: "forex",
        ticker: agg.ticker,
        high: agg.high ?? null,
        low: agg.low ?? null,
        close: agg.close ?? null,
        history: Array.isArray(agg.history) ? agg.history.slice(-15) : []
    }))
}

async function aggregateMetalsJsonLight() {
    const commodities = await readJsonFile('commodities.json')
    return commodities.map((agg) => ({
        type: "commodity",
        ticker: agg.ticker,
        name: agg.name,
        price: agg.price ?? null,
        high: agg.high ?? null,
        low: agg.low ?? null,
        close: agg.close ?? null,
        history: Array.isArray(agg.history) ? agg.history.slice(-15) : []
    }))
}

// ==========================================
// FUNCTIONS WITH SUPER LIGHT DATA FOR LIST ON list.js
// ==========================================

async function getBriefStocksJson() {
    const stocks = await readJsonFile('nasdaq.json')
    return stocks.map(s => ({ type: "nasdaq", ticker: s.ticker, name: s.name }))
}

async function getBriefForexJson() {
    const forex = await readJsonFile('forex.json')
    return forex.map(f => ({ type: "forex", ticker: f.ticker, name: f.ticker.replace("C:", "").replace("EUR", "EUR / ") }))
}

async function getBriefCommoditiesJson() {
    const commodities = await readJsonFile('commodities.json')
    return commodities.map(c => ({ type: "commodity", ticker: c.ticker, name: c.name }))
}

export default { 
  getMultipleAggregatesJson, 
  aggregateForexJson, 
  aggregateMetalsJson,
  getMultipleAggregatesJsonLight,
  aggregateForexJsonLight,
  aggregateMetalsJsonLight,
  getBriefStocksJson,
  getBriefForexJson,
  getBriefCommoditiesJson
}