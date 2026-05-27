import http from "./instanceHttp/js"

async function getCachedAssets() {
  const cache = localStorage.getItem("assets")

  if (cache) {
    return JSON.parse(cache)
  }

  const stocks = await getStock()
  const forex = await getForex()
  const commodities = await getCommodities()

  const all = [...stocks, ...forex, ...commodities]

  localStorage.setItem("assets", JSON.stringify(all))

  return all
}