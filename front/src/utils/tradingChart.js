export function loadTradingViewChart(ticker) {
  new TradingView.widget({
    container_id: `tv-${ticker}`,
    symbol: ticker,
    interval: "D",
    width: "100%",
    height: 120,
    theme: "dark",
    style: "1",
    locale: "en",
    hide_top_toolbar: true,
    hide_legend: true,
    allow_symbol_change: false
  })
}