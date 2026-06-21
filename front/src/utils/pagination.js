import http from "../config/instanceHttp.js"
import { decodeToken } from "../middlewares/roleGuard.js"

export function createPaginator({
    endpoint,
    limit = 5,
    render,
    getPayload = () => decodeToken(localStorage.getItem("token")),
    mapResponse = (res) => res }) {

    let refs = { next: null, prev: null }
    let config = { endpoint }
    let offset = 0
    let hasNext = true

    async function load() {
        try {
            const separator = config.endpoint.includes('?') ? '&' : '?'
            const url = `${config.endpoint}${separator}limit=${limit}&offset=${offset}`

            const res = await http.get(url)
            const data = mapResponse(res, offset)
                console.log("DATA", data)

            hasNext = data.hasNext ?? false

            render(data.results || [], getPayload(), {
                offset,
                hasNext
            })

            updateButtons()
        } catch (error) {
            console.error("Paginator error:", error)
        }
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
        refs.next = nextBtn
        refs.prev = prevBtn
        
        if (nextBtn) nextBtn.onclick = next
        if (prevBtn) prevBtn.onclick = prev
        updateButtons()
    }

    function updateButtons() {
        if (refs.next) refs.next.disabled = !hasNext
        if (refs.prev) refs.prev.disabled = offset === 0
    }

    return {
        load,
        next,
        prev,
        reset,
        bind,
        setEndpoint: (newEndpoint) => {
            config.endpoint = newEndpoint
            offset = 0
            hasNext = true
        }
    }
}