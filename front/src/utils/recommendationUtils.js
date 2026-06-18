export function getRecommendationIcon(status) {
    if (status === "BUY") {
        return "/assets/arrows/up-green.svg"
    } 
    
    if (status === "SELL") {
        return "/assets/arrows/down-red.svg"
    }
    
    return "/assets/arrows/medium-blue.svg"
}