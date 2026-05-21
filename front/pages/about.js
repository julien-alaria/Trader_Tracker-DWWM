function navLinks(label) {
    return `<a href="#">${label}</a>`
}

const about =   `<div>
                    ${navLinks("Products")}
                    ${navLinks("About")}
                    ${navLinks("Company")}
                </div>`

export default about