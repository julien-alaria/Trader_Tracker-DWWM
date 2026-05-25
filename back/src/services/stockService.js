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

  const results = await Promise.all(
    tickers.map(async (ticker) => {
      const [metaRes, aggRes] = await Promise.all([
        rest.getTicker({ ticker }), // name + market_cap
        rest.getStocksAggregates({
          stocksTicker: ticker,
          multiplier: "1",
          timespan: "day",
          from: "2026-04-25",
          to: "2026-05-04",
          adjusted: "true",
          sort: "desc",
          limit: "1",
        })
      ])

      const meta = metaRes.results
      const last = aggRes.results?.at(-1)

      return {
        ticker: meta.ticker,
        name: meta.name,
        marketCap: meta.market_cap,
        price: last?.c ?? null,
        high: last?.h ?? null,
        low: last?.l ?? null
      }
    })
  )

  return results
}

export default { getAAPLStock,  getMultipleAggregates }