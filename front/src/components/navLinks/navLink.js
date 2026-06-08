export default function navLink(link, label, id = "") {
    const idAttr = id ? `id="${id}"` : ""

    return `<a href="#${link}" ${idAttr}>${label}</a>`
}
