import fs from "fs/promises"
import path from "path"
import { restClient } from '@massive.com/client-js'
import dotenv from 'dotenv'

dotenv.config()
const rest = restClient(process.env.POLY_API_KEY)

const TICKERS = []

const tickersResponse = await rest.listTickers({
  market: "stocks",
  active: true,
  exchange: "XNAS",
  limit: 1000
})

const dataResults = tickersResponse.results || []

// Map them into your TICKERS array and cap it at 1000
for (const stock of dataResults) {
  TICKERS.push(stock.ticker)
  if (TICKERS.length >= 1000) break
}

console.log(`${TICKERS.length} tickers chargés`)

// PATH OF SAVE FILE
const OUTPUT_PATH = path.resolve("./src/data/nasdaq.json")

async function runScraper() {
  const results = []
  
  console.log(`==================================================`)
  console.log(`SCRAPER START`)
  console.log(`ASSETS TO SCRAP : ${TICKERS.length}`)
  console.log(`==================================================\n`)

  for (const ticker of TICKERS) {
    try {
      const currentStep = results.length + 1
      console.log(`⭳ [${currentStep}/${TICKERS.length}] Downloading data for ${ticker}...`)

      // SDK Massive (Polygon) API CALLING
      const metaRes = await rest.getTicker({ ticker })
      const aggRes = await rest.getStocksAggregates({ 
        stocksTicker: ticker, 
        multiplier: "1", 
        timespan: "day", 
        from: "2025-06-09", 
        to: "2026-06-09", 
        adjusted: "true", 
        sort: "asc",
        limit: "500", 
      })

      const meta = metaRes.results
      const dataPoints = aggRes.results || []
      const last = dataPoints.at(-1) 
      
      // CANDLES STRUCTURE
      const history = dataPoints.map(point => ({
        o: point.o, 
        h: point.h, 
        l: point.l, 
        c: point.c, 
        x: point.t 
      }))
      
      results.push({ 
        type: "nasdaq",
        ticker: meta.ticker, 
        name: meta.name, 
        image: meta.branding?.logo_url ?? null,
        marketCap: meta.market_cap,
        price: last?.c ?? null, 
        high: last?.h ?? null, 
        low: last?.l ?? null,
        history: history
      })

      console.log(`[OK] ${ticker} saved (${history.length} candles).`)
      
      // Security anti-429
      if (results.length < TICKERS.length) {
        console.log("⋯ [WAIT] 25-second pause...")
        await new Promise(r => setTimeout(r, 25000))
      }

    } catch (error) {
      console.error(`[ERR] Error on ticker ${ticker}:`, error.message)
      console.log(`10-second safety pause...`)
      await new Promise(r => setTimeout(r, 10000))
    }
  }

  // SAVE ON FILE JSON
  try {
    await fs.mkdir(path.dirname(OUTPUT_PATH), { recursive: true })
    await fs.writeFile(OUTPUT_PATH, JSON.stringify(results, null, 2), "utf-8")
    
    console.log(`\n==================================================`)
    console.log(`[OK] SCRAPING SUCCESSFULLY COMPLETED`)
    console.log(` File updated : ${OUTPUT_PATH}`)
    console.log(`==================================================`)
  } catch (err) {
    console.error(`[ERR] Erreur d'écriture du fichier JSON :`, err.message)
  }
}

runScraper()