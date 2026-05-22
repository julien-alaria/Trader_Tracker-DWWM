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

async function getTicker() {
  try {
    const response = await rest.getTicker(
      {
        ticker: "AAPL",
      }
    );
    console.log('Response:', response);
  } catch (e) {
    console.error('An error happened:', e);
  }
}

export default { getAAPLStock, getTicker }