export function formatForexName(ticker) {
    return ticker
        .replace("C:", "")
        .replace(/(.{3})(.{3})/, "$1 / $2")
}

export function formatMarketCap(marketCap) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2
  }).format(marketCap)
}

export function formatValues(value) {
  if (value >= 1_000_000_000) {
    return (value / 1_000_000_000).toFixed(2) + " B"
  }

  if (value >= 1_000_000) {
    return (value / 1_000_000).toFixed(2) + " M"
  }

  return value.toString()
}
