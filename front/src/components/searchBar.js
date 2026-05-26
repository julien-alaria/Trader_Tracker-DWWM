export default function createSearchBar(onSearch) {

    const wrapper = document.createElement("div")

    const input = document.createElement("input")
    input.type = "search"
    input.placeholder = "Rechercher..."

    const resultsContainer = document.createElement("div")

    input.addEventListener("input", (e) => {

        const value = e.target.value.toLowerCase()

        onSearch(value, resultsContainer)
    })

    wrapper.appendChild(input)
    wrapper.appendChild(resultsContainer)

    return wrapper
}