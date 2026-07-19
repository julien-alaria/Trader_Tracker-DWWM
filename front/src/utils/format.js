// SECURITY: escape any user-provided text (bio, comment, etc.) before
// injecting it into innerHTML, to prevent stored XSS.
export function escapeHtml(str) {
  if (str === null || str === undefined) return ""
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;")
}

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

export function formatTicker(ticker) {
  return ticker.replace(/[^a-zA-Z0-9]/g, "_")
}

export function formatChartId(ticker) {
  return `tv-${formatTicker(ticker)}`
}

export function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  })
}