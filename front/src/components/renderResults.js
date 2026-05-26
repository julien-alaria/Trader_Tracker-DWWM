export default function renderResults(results, container) {

    container.innerHTML = ""

    if (results.length === 0) {
        container.innerHTML = "<p>Aucun résultat</p>"
        return
    }

    results.forEach((item) => {

        const div = document.createElement("div")
        div.classList.add("result-item")

        div.innerHTML = `
            <strong>${item.ticker}</strong>
            <p>${item.name ?? item.type ?? ""}</p>
        `

        container.appendChild(div)
    })
}