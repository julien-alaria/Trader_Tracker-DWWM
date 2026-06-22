// For use of trading view charts widget

/*export function loadTradingViewChart(ticker) {

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
}*/

// For use of ApexCharts
export function loadTradingViewChart(ticker, historyData = [], isMini = false) {
 
  const container = document.getElementById(`tv-${ticker}`)
  if (!container || !historyData.length) return

  // mapping Polygon Datas (x, o, h, l, c)
  const candlestickData = historyData.map((candle) => ({
    x: candle.x,
    y: [candle.o, candle.h, candle.l, candle.c]
  }))

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
  }

  container.innerHTML = ''
  const chart = new ApexCharts(container, options)
  chart.render()
}

/**
 * Génère un mini graphique Sparkline ultra-stylisé (Style TradingView / Premium)
 * avec dégradé de couleur et adaptation dynamique (Vert/Rouge selon la tendance)
 */
export function loadMiniChart(ticker, historyData = []) {
  const container = document.getElementById(`tv-${ticker}`)
  if (!container || !historyData.length) return

  // 1. Isoler les 15 derniers points
  const limitedHistory = historyData.slice(-15)

  // 2. Normalisation des données
  const cleanData = limitedHistory.map((point) => {
    if (point === null || point === undefined) return 0
    if (typeof point === 'number') return point
    return point.c ?? point.close ?? point.price ?? point.value ?? point.y ?? 0
  })

  // 3. Calcul de la tendance (Est-ce que le dernier prix est supérieur au premier ?)
  const firstPrice = cleanData[0] || 0
  const lastPrice = cleanData[cleanData.length - 1] || 0
  const isPositive = lastPrice >= firstPrice

  // Couleur dynamique : Vert TradingView (#089981) ou Rouge Crash (#f23645)
  const chartColor = isPositive ? "#089981" : "#f23645"

  // 4. Configuration graphique avancée (Area avec dégradé néon)
  const options = {
    chart: {
      type: "area", // Changement en 'area' pour avoir le remplissage sous la courbe
      height: 80,
      sparkline: {
        enabled: true
      },
      animations: {
        enabled: true,
        easing: "easeinout",
        dynamicAnimation: {
          speed: 600
        }
      },
      background: "transparent",
      dropShadow: {
        enabled: true,
        top: 2,
        left: 0,
        blur: 4,
        color: chartColor,
        opacity: 0.15 // Effet de lueur diffuse sous la ligne
      }
    },
    stroke: {
      curve: "smooth", // Courbe fluide très esthétique
      width: 2.5       // Ligne légèrement plus épaisse pour ressortir du fond
    },
    fill: {
      type: "gradient",
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45, // Plus opaque en haut
        opacityTo: 0.0,   // Totalement invisible en bas
        stops: [0, 90, 100]
      }
    },
    series: [{
      name: ticker,
      data: cleanData
    }],
    colors: [chartColor], // Applique le vert ou le rouge calculé
    tooltip: {
      enabled: false
    }
  }

  container.innerHTML = ''
  const chart = new ApexCharts(container, options)
  chart.render()
}