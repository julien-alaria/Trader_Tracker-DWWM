import { restClient } from '@massive.com/client-js'
import dotenv from 'dotenv'

dotenv.config()
const rest = restClient(process.env.POLY_API_KEY)
/**
 * imports, roads & utils for LOCAL JSON
 */
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

/**
 * 
 * functions for MASSIVE API
 */

async function getAAPLStock(req, res) {
    return rest.getStocksAggregates(
      {
        stocksTicker: "INTC",
        multiplier: "1",
        timespan: "day",
        from: "2026-04-25",
        to: "2026-05-04",
        adjusted: "true",
        sort: "asc",
        limit: "10",
      }
    )
}

async function getMultipleAggregates() { 
  // filter for results
  const tickers = ["MSFT", "NVDA", "AMZN", "INTC"] 
  
  const results = await Promise.all( tickers.map(async (ticker) => { 
    const [metaRes, aggRes] = await Promise.all([ rest.getTicker({ ticker }), 
      rest.getStocksAggregates({ 
        stocksTicker: ticker, 
        multiplier: "1", 
        timespan: "day", 
        from: "2025-06-09", 
        to: "2026-06-09", 
        adjusted: "true", 
        sort: "desc", 
        limit: "30", 
      }) ]) 
      const meta = metaRes.results 
      const last = aggRes.results?.at(-1) 
      
      return { 
        type: "nasdaq",
        ticker: meta.ticker, 
        name: meta.name, 
        marketCap: meta.market_cap,
        price: last?.c ?? null, 
        high: last?.h ?? null, 
        low: last?.l ?? null
      } 
    }) 
  ) 
  // anti 429
    await new Promise(r => setTimeout(r, 500))
  return results 

}

async function aggregateForex() {
  // filter for results
  const tickers = ["C:EURUSD", "C:EURJPY", "C:EURCHF"]

  const results = []

  for (const ticker of tickers) {

    const url =
      `https://api.massive.com/v2/aggs/ticker/${ticker}/prev` +
      `?adjusted=true` +
      `&apiKey=${process.env.POLY_API_KEY}`

    const response = await fetch(url)
    const data = await response.json()

    const agg = data.results?.[0]

    results.push({
      type: "forex",
      ticker,
      open: agg?.o,
      high: agg?.h,
      low: agg?.l,
      close: agg?.c,
      volume: agg?.v,
      timestamp: agg?.t
    })

    // anti 429
    await new Promise(r => setTimeout(r, 500))
  }
  return results
}

async function aggregateMetals() {
  // filter for results
  const tickers = ["C:XAUUSD", "C:XAGUSD"]

  const results = []

  for (const ticker of tickers) {

    const url =
      `https://api.massive.com/v2/aggs/ticker/${ticker}/prev` +
      `?adjusted=true` +
      `&apiKey=${process.env.POLY_API_KEY}`

    const response = await fetch(url)
    const data = await response.json()

    const agg = data.results?.[0]

    results.push({
      type: "commodity",
      ticker,

      name:
        ticker === "C:XAUUSD" ? "Gold" :
        "Silver",

      price: agg?.c ?? null,
      high: agg?.h ?? null,
      low: agg?.l ?? null,
      open: agg?.o ?? null,
      close: agg?.c ?? null
    })

    // anti 429
    await new Promise(r => setTimeout(r, 500))
  }

  return results
}

/**
 * functions for LOCAL JSON
 */
async function getAAPLStockJson(req, res) {

  const stocks = await readJsonFile('nasdaq.json')

  return {
    results: stocks
  }
}

async function getMultipleAggregatesJson() {
 
  const stocks = await readJsonFile('nasdaq.json')
  const POLYGON_API_KEY = process.env.POLY_API_KEY

  return stocks.map((stock) => {

    let finalImageUrl = null

    if (stock.image) {
      // Redirection to the correct Polygon server which knows how to decode and validate the parameter ?apiKey=
      const cleanUrl = stock.image.replace("api.massive.com", "api.polygon.io")
      finalImageUrl = `${cleanUrl}?apiKey=${POLYGON_API_KEY}`
    } else {
      // Fallback si pas de logo trouvé dans le JSON
      finalImageUrl = "/assets/nasdaq_logo.svg.png"
    }

    const meta = {
      ticker: stock.ticker,
      name: stock.name,
      market_cap: stock.marketCap,
      image: finalImageUrl
    }

    const last = {
      c: stock.price,
      h: stock.high,
      l: stock.low
    }

    return {
      type: "nasdaq",
      ticker: meta.ticker,
      name: meta.name,
      image: meta.image,
      marketCap: meta.market_cap,
      price: last?.c ?? null,
      high: last?.h ?? null,
      low: last?.l ?? null,
      history: stock.history || []
    }
  })
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

export default { getAAPLStock,  getMultipleAggregates, aggregateForex, aggregateMetals, getAAPLStockJson,  getMultipleAggregatesJson, aggregateForexJson, aggregateMetalsJson }