import http from "../../config/instanceHttp.js"
import { escapeHtml } from "../../utils/format.js"

const WIDGET_HTML = `
    <div id="assistant-bubble" class="assistant-bubble" title="Need help?">
        <i class="fa-solid fa-comment-dots"></i>
    </div>
    <div id="assistant-panel" class="assistant-panel" hidden>
        <div class="assistant-header">
            <span>Trader Tracker Assistant</span>
            <button type="button" id="assistant-close">&times;</button>
        </div>
        <div id="assistant-messages" class="assistant-messages"></div>
        <form id="assistant-form" class="assistant-form">
            <input type="text" id="assistant-input" placeholder="Ask a question..." autocomplete="off" required />
            <button type="submit">Send</button>
        </form>
    </div>
`

export function initAssistantWidget() {
    if (document.getElementById("assistant-bubble")) return 

    const container = document.createElement("div")
    container.innerHTML = WIDGET_HTML
    document.body.appendChild(container)

    const bubble = document.getElementById("assistant-bubble")
    const panel = document.getElementById("assistant-panel")
    const closeBtn = document.getElementById("assistant-close")
    const form = document.getElementById("assistant-form")
    const input = document.getElementById("assistant-input")
    const messages = document.getElementById("assistant-messages")

    bubble.addEventListener("click", () => {
        panel.hidden = !panel.hidden
        if (!panel.hidden) input.focus()
    })
    closeBtn.addEventListener("click", () => {
        panel.hidden = true
    })

    form.addEventListener("submit", async (e) => {
        e.preventDefault()
        const question = input.value.trim()
        if (!question) return

        appendMessage("user", question)
        input.value = ""
        input.disabled = true

        const answerEl = appendMessage("assistant", "...")

        try {
            const result = await http.post("/assistant", { question })
            answerEl.innerHTML = escapeHtml(result.answer)

            if (result.sources && result.sources.length > 0) {
                const sourcesEl = document.createElement("div")
                sourcesEl.className = "assistant-sources"
                sourcesEl.textContent = "Sources: " + result.sources.join(", ")
                answerEl.appendChild(sourcesEl)
            }
        } catch (err) {
            answerEl.textContent = err.response?.data?.message || "The assistant is currently unavailable."
        } finally {
            input.disabled = false
            input.focus()
        }
    })

    function appendMessage(role, text) {
        const el = document.createElement("div")
        el.className = `assistant-message assistant-message-${role}`
        el.innerHTML = escapeHtml(text)
        messages.appendChild(el)
        messages.scrollTop = messages.scrollHeight
        return el
    }
}