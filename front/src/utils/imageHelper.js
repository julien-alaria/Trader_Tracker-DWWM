export function formatAssetImage(ticker) {
    if (!ticker) return "/assets/nasdaq_logo.png"
    
    const fileName = `${ticker.toLowerCase()}.svg`
    

    return `/assets/logos/${fileName}`
}