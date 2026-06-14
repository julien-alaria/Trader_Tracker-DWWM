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

export function loadTradingViewChart(ticker, historyData = [], isMini = false) {
 
  const container = document.getElementById(`tv-${ticker}`);
  if (!container || !historyData.length) return;

  // mapping Polygon Datas (x, o, h, l, c)
  const candlestickData = historyData.map((candle) => ({
    x: candle.x,
    y: [candle.o, candle.h, candle.l, candle.c]
  }));

  const options = {
    chart: {
      type: "candlestick",
      height: isMini ? 80 : 350,
      sparkline: {
        enabled: isMini
      },
      toolbar: {
        show: false
      },
      zoom: {
        enabled: !isMini
      },
      background: "transparent",
      animations: {
        enabled: !isMini 
      }
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
        show: !isMini
      }
    },

    yaxis: {
      show: !isMini,
      tooltip: {
        enabled: !isMini
      }
    },

    grid: {
      show: false,
      borderColor: "#333"
    },

    tooltip: {
      enabled: !isMini,
      theme: "dark"
    }
  };

  container.innerHTML = '';
  const chart = new ApexCharts(container, options);
  chart.render();
}