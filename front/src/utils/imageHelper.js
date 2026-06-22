const commodityImages = {
    "C:XAUUSD": "/assets/gold.webp",
    "C:XAGUSD": "/assets/silver.webp",
    "C:XPTUSD": "/assets/platinum.webp",
    "C:COPPERUSD": "/assets/copper.webp",
    "C:XPDUSD": "/assets/palladium.webp"
}

export function formatAssetImage(ticker) {
    if (!ticker) return "/assets/nasdaq_logo.webp"
    
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
       
        return `/assets/${base}_${quote}.webp`
    }
    
    return `/assets/logos/${fileName}.svg`
}