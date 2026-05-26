import { restClient } from '@massive.com/client-js'
import dotenv from 'dotenv'

dotenv.config()

const rest = restClient(process.env.POLY_API_KEY)

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
  const tickers = ["MSFT", "NVDA", "AMZN", "INTC"] 
  const results = await Promise.all( tickers.map(async (ticker) => { 
    const [metaRes, aggRes] = await Promise.all([ rest.getTicker({ ticker }), 
      rest.getStocksAggregates({ 
        stocksTicker: ticker, 
        multiplier: "1", 
        timespan: "day", 
        from: "2026-04-25", 
        to: "2026-05-04", 
        adjusted: "true", 
        sort: "desc", 
        limit: "1", 
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

export default { getAAPLStock,  getMultipleAggregates, aggregateForex, aggregateMetals }