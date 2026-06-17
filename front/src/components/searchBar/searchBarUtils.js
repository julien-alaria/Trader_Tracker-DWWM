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

export function initGenericSearchBar({ targetSelector, data, onSelect }) {
    const containerTarget = document.querySelector(targetSelector)
    if (!containerTarget) return

    // Call to create the bar with integrated filtering logic
    const searchBar = createSearchBar((value, resultsContainer) => {
        const query = value.trim().toLowerCase()
        
        if (!query) { 
            resultsContainer.innerHTML = ""
            return 
        }

        // Filtering on the ticker or asset name
        const filtered = data.filter(item =>
            (item.ticker ?? "").toLowerCase().includes(query) ||
            (item.name ?? "").toLowerCase().includes(query)
        )

        // Strictly limited to a maximum of 5 results
        const limitedResults = filtered.slice(0, 5)

        // Original rendering: the received onSelect is passed directly to it
        renderResults(limitedResults, resultsContainer, onSelect)
    })

    // Cleaning of the target area and injection of the complete component
    containerTarget.innerHTML = ""
    containerTarget.appendChild(searchBar)
}