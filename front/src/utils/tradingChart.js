export function loadTradingViewChart(ticker) {

  new TradingView.widget({
    container_id: `tv-${ticker}`,
    symbol: ticker,
    interval: "W",
    autosize: true,
    theme: "light",
    style: "1",
    locale: "en",
    hide_top_toolbar: true,
    hide_legend: true,
    allow_symbol_change: false
  })
}

// export function loadTradingViewChart(ticker, historyData = []) {
//   const isUp = historyData[historyData.length - 1] >= historyData[0];
//   const chartColor = isUp ? '#00b4d8' : '#ef476f'; 

//   const options = {
//     chart: {
//       type: 'area',
//       height: 80,
//       sparkline: { enabled: true },
//       animations: { enabled: true }
//     },
//     stroke: { curve: 'smooth', width: 2, colors: [chartColor] },
//     fill: {
//       type: 'gradient',
//       gradient: { shadeIntensity: 1, opacityFrom: 0.35, opacityTo: 0.05, stops: [0, 100] },
//       colors: [chartColor]
//     },
//     series: [{
//       name: 'Price',
//       data: historyData // <-- Reçoit les 26 vrais points (Plus aucun NaN !)
//     }],
//     tooltip: { enabled: true }
//   };

//   const container = document.querySelector(`#chart-${ticker}`);
//   if (container) {
//     const chart = new ApexCharts(container, options);
//     chart.render();
//   }
// }