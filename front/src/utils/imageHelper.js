const commodityImages = {
    "C:XAUUSD": "/assets/gold.png",
    "C:XAGUSD": "/assets/silver.png",
    "C:XPTUSD": "/assets/platinum.png",
    "C:COPPERUSD": "/assets/copper.png",
    "C:XPDUSD": "/assets/palladium.png"
}

export function formatAssetImage(ticker) {
    if (!ticker) return "/assets/nasdaq_logo.png"
    
    const cleanTicker = String(ticker).replace(/[\s\r\n]/g, "").toUpperCase()
    
    if (commodityImages[cleanTicker]) {
        return commodityImages[cleanTicker]
    }
    
    let fileName = cleanTicker.toLowerCase()
    if (fileName.startsWith("c:")) {
        fileName = fileName.replace("c:", "")
    }

    if (fileName.length === 6) {
        const base = fileName.substring(0, 3)
        const quote = fileName.substring(3, 6)
       
        return `/assets/${base}_${quote}.jpeg`
    }
    
    return `/assets/logos/${fileName}.svg`
}