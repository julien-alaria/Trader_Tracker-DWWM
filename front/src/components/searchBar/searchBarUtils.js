export function createSearchBar(onSearch) {

    const wrapper = document.createElement("div")
    wrapper.className = "search-wrapper"

    const input = document.createElement("input")
    input.type = "search"
    input.className="search-input"
    input.placeholder = "Search an asset..."

    const resultsContainer = document.createElement("div")
    resultsContainer.className = "result-container"

    input.addEventListener("input", (e) => {
        onSearch(e.target.value.toLowerCase(), resultsContainer)
    })

    wrapper.appendChild(input)
    wrapper.appendChild(resultsContainer)

    return wrapper
}

export function renderResults(results, container, onSelect) {

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
        div.style.cursor = "pointer"

        div.addEventListener("click", () => {
            onSelect(item)
        })

        container.appendChild(div)
    })
}
