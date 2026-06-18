const chartInstances = new Map()

export function registerChart(ticker, instance) {
  chartInstances.set(ticker, instance)
}

export function destroyChart(ticker) {
  const chart = chartInstances.get(ticker)
  if (chart?.remove) chart.remove()
  chartInstances.delete(ticker)
}

export function destroyRange(tickers) {
  tickers.forEach(destroyChart)
}