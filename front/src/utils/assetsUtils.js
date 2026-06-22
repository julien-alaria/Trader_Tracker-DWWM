import http from "../config/instanceHttp.js"
import { formatMarketCap } from "./format.js"


// Functions for external API
async function getStock() {
  try {
    const data = await http.get("/assets/stocks")

    return data.message.map((stock) => ({
      ticker: stock.ticker,
      name: stock.name,
      image: stock.image,
      marketCap: formatMarketCap(stock.marketCap),
      price: stock.price,
      high: stock.high,
      low: stock.low,
      history: stock.history
    }))
  } catch (error) {
    console.error(error.message)
    return []
  }
}

async function getForex() {
  function formatForexName(ticker) {
    return ticker.replace("C:", "").replace(/(.{3})(.{3})/, "$1 / $2")
  }

  try {
    const data = await http.get("/assets/forex")

    return data.message.map((forex) => ({
      ticker: forex.ticker,
      name: formatForexName(forex.ticker),
      high: forex.high,
      low: forex.low,
      close: forex.close,
      history: forex.history
    }))
  } catch (error) {
    console.error(error.message)
    return []
  }
}

async function getCommodities() {
  try {
    const data = await http.get("/assets/commodities")

    return data.message.map((commodity) => ({
      ticker: commodity.ticker,
      name: commodity.name,
      price: commodity.price,
      high: commodity.high,
      low: commodity.low,
      close: commodity.close,
      history: commodity.history
    }))
  } catch (error) {
    console.error(error.message)
    return []
  }
}

// Functions for Light Datas in External API
async function getStockLight() {
  try {
    const data = await http.get("/assets/home/stocks") // Cible la route light

    return data.message.map((stock) => ({
      ticker: stock.ticker,
      name: stock.name,
      image: stock.image,
      marketCap: formatMarketCap(stock.marketCap),
      price: stock.price,
      high: stock.high,
      low: stock.low,
      history: stock.history // Contient les 15 points
    }))
  } catch (error) {
    console.error(error.message)
    return []
  }
}

async function getForexLight() {
  function formatForexName(ticker) {
    return ticker.replace("C:", "").replace(/(.{3})(.{3})/, "$1 / $2")
  }

  try {
    const data = await http.get("/assets/home/forex") // Cible la route light

    return data.message.map((forex) => ({
      ticker: forex.ticker,
      name: formatForexName(forex.ticker),
      high: forex.high,
      low: forex.low,
      close: forex.close,
      history: forex.history // Contient les 15 points
    }))
  } catch (error) {
    console.error(error.message)
    return []
  }
}

async function getCommoditiesLight() {
  try {
    const data = await http.get("/assets/home/commodities") // Cible la route light

    return data.message.map((commodity) => ({
      ticker: commodity.ticker,
      name: commodity.name,
      price: commodity.price,
      high: commodity.high,
      low: commodity.low,
      close: commodity.close,
      history: commodity.history // Contient les 15 points
    }))
  } catch (error) {
    console.error(error.message)
    return []
  }
}

// For list.js
async function getBriefStocks() {
  try {
    const data = await http.get("/assets/brief/stocks");
    return data.message || [];
  } catch (error) {
    console.error(error.message);
    return [];
  }
}

async function getBriefForex() {
  try {
    const data = await http.get("/assets/brief/forex");
    return data.message || [];
  } catch (error) {
    console.error(error.message);
    return [];
  }
}

async function getBriefCommodities() {
  try {
    const data = await http.get("/assets/brief/commodities");
    return data.message || [];
  } catch (error) {
    console.error(error.message);
    return [];
  }
}

export { 
  getStock, 
  getForex, 
  getCommodities,
  getStockLight,
  getForexLight,
  getCommoditiesLight,
  getBriefStocks, getBriefForex, getBriefCommodities
 }
