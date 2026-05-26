export default function formatForexName(ticker) {
    return ticker
        .replace("C:", "")
        .replace(/(.{3})(.{3})/, "$1 / $2")
}