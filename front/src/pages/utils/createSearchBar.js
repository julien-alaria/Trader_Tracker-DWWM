export default function createSearchBar(onSearch) {

    const wrapper = document.createElement("div")

    const input = document.createElement("input")
    input.type = "search"
    input.placeholder = "Rechercher..."

    const resultsContainer = document.createElement("div")
    resultsContainer.className = "result-container"

    input.addEventListener("input", (e) => {
        onSearch(e.target.value.toLowerCase(), resultsContainer)
    })

    wrapper.appendChild(input)
    wrapper.appendChild(resultsContainer)

    return wrapper
}