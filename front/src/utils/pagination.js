import http from "../config/instanceHttp.js"
import { decodeToken } from "../middlewares/roleGuard.js"

export function createPaginator({
    endpoint,
    limit = 3,
    render,
    getPayload = () => decodeToken(localStorage.getItem("token")),
    mapResponse = (res) => res
}) {
    let offset = 0
    let hasNext = true

    async function load() {
        const res = await http.get(`${endpoint}?limit=${limit}&offset=${offset}`)
        const data = mapResponse(res)

        hasNext = data.hasNext ?? false

        render(data.results || [], getPayload(), {
            offset,
            hasNext
        })

        updateButtons()
    }

    function next() {
        if (!hasNext) return
        offset += limit
        return load()
    }

    function prev() {
        offset = Math.max(0, offset - limit)
        return load()
    }

    function reset() {
        offset = 0
        return load()
    }

    function bind({ nextBtn, prevBtn }) {
        if (nextBtn) nextBtn.onclick = next
        if (prevBtn) prevBtn.onclick = prev
    }

    function updateButtons() {
        const nextBtn = document.getElementById("next-btn")
        const prevBtn = document.getElementById("prev-btn")

        if (nextBtn) nextBtn.disabled = !hasNext
        if (prevBtn) prevBtn.disabled = offset === 0
    }

    return {
        load,
        next,
        prev,
        reset,
        bind
    }
}