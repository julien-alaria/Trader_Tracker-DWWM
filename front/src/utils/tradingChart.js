// export function loadTradingViewChart(ticker) {

//   new TradingView.widget({
//     container_id: `tv-${ticker}`,
//     symbol: ticker,
//     interval: "W",
//     autosize: true,
//     theme: "light",
//     style: "1",
//     locale: "en",
//     hide_top_toolbar: true,
//     hide_legend: true,
//     allow_symbol_change: false
//   })
// }

export function loadTradingViewChart(ticker, historyData = []) {
  const container = document.querySelector(`#tv-${ticker}`);
  if (!container || !historyData.length) return;

  // Polygon Datas
  const candlestickData = historyData.map((candle) => ({
    x: candle.x,
    y: [candle.o, candle.h, candle.l, candle.c]
  }));

  const options = {
    chart: {
      type: "candlestick",
      height: 200,
      toolbar: {
        show: false
      },
      zoom: {
        enabled: true
      },
      background: "transparent"
    },

    series: [{
      name: ticker,
      data: candlestickData
    }],

    plotOptions: {
      candlestick: {
        colors: {
          upward: "#089981",
          downward: "#f23645"
        },
        wick: {
          useFillColor: true
        }
      }
    },

    xaxis: {
      type: "datetime",
      labels: {
        show: true
      }
    },

    yaxis: {
      tooltip: {
        enabled: true
      }
    },

    grid: {
      show: false,
      borderColor: "#333"
    },

    tooltip: {
      enabled: true,
      theme: "dark"
    }
  };

  container.innerHTML = '';
  const chart = new ApexCharts(container, options);
  chart.render();
}