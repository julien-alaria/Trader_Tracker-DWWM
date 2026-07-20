import http from "../config/instanceHttp.js"
import { formatMarketCap, formatForexName } from "./format.js"

// ==========================================
// Functions for external API
// ==========================================

// ==========================================
// FUNCTIONS WITH FULL DATA FOR CHARTS ON assetDetails.js
// ==========================================
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
    console.error(error.response?.data?.message || error.message)
    return []
  }
}

async function getForex() {
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
    console.error(error.response?.data?.message || error.message)
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
    console.error(error.response?.data?.message || error.message)
    return []
  }
}

// ==========================================
// FUNCTIONS WITH LIGHT DATA FOR CHARTS ON home.js
// ==========================================
async function getStockLight() {
  try {
    const data = await http.get("/assets/home/stocks") 

    return data.message.map((stock) => ({
      ticker: stock.ticker,
      name: stock.name,
      image: stock.image,
      marketCap: formatMarketCap(stock.marketCap),
      price: stock.price,
      high: stock.high,
      low: stock.low,
      history: stock.history // Contains 15 points for light chart
    }))
  } catch (error) {
    console.error(error.response?.data?.message || error.message)
    return []
  }
}

async function getForexLight() {
  try {
    const data = await http.get("/assets/home/forex")

    return data.message.map((forex) => ({
      ticker: forex.ticker,
      name: formatForexName(forex.ticker),
      high: forex.high,
      low: forex.low,
      close: forex.close,
      history: forex.history
    }))
  } catch (error) {
    console.error(error.response?.data?.message || error.message)
    return []
  }
}

async function getCommoditiesLight() {
  try {
    const data = await http.get("/assets/home/commodities")

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
    console.error(error.response?.data?.message || error.message)
    return []
  }
}

// ==========================================
// FUNCTIONS WITH SUPER LIGHT DATA FOR LIST ON list.js
// ==========================================

// ONLY getBriefsAssets function is used for now (endpoints are also not implemented)
async function getBriefStocks() {
  try {
    const data = await http.get("/assets/brief/stocks");
    return data.message || [];
  } catch (error) {
    console.error(error.response?.data?.message || error.message);
    return [];
  }
}

async function getBriefForex() {
  try {
    const data = await http.get("/assets/brief/forex");
    return data.message || [];
  } catch (error) {
    console.error(error.response?.data?.message || error.message);
    return [];
  }
}

async function getBriefCommodities() {
  try {
    const data = await http.get("/assets/brief/commodities");
    return data.message || [];
  } catch (error) {
    console.error(error.response?.data?.message || error.message);
    return [];
  }
}

async function getBriefAssets() {
  try {
    const data = await http.get("/assets/brief/all")
    return data.message || []
  } catch (error) {
    console.error(error.response?.data?.message || error.message)
    return []
  }
}

export { 
  getStock, 
  getForex, 
  getCommodities,
  getStockLight,
  getForexLight,
  getCommoditiesLight,
  getBriefStocks, 
  getBriefForex, 
  getBriefCommodities,
  getBriefAssets
 }
