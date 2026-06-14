import http from "../../config/instanceHttp.js"
import { createPaginator } from "../../utils/pagination.js"
import { formatDate } from "../../utils/format.js"
import { decodeToken } from "../../middlewares/roleGuard.js"

// =====================
// TEMPLATE
// =====================
const analystDetailsPage = `
<main>
    <section>
        <h1>Analyst Detail Page</h1>
        <div id="analyst-detail"></div>
    </section>

    <section id="analyst-recommendation">
        <h2>This Analyst Recommendations</h2>

        <div id="analyst-recommendation-container"></div>

        <div id="analyst-pagination">
            <button id="ana-prev-btn">Previous</button>
            <button id="ana-next-btn">Next</button>
        </div>
    </section>
</main>
`

export default analystDetailsPage

// =====================
// PAGINATOR
// =====================
const recommendationsPaginator = createPaginator({
    endpoint: "/recommendations/analyst",
    limit: 3,
    render: renderRecommendations,
    mapResponse: (res) => ({
        results: res.results,
        hasNext: res.hasNext
    })
})

// =====================
// INIT
// =====================
export async function initAnalystDetail() {
    try {
        const params = new URLSearchParams(window.location.hash.split("?")[1])
        const analystId = params.get("id")

        if (!analystId) {
            console.error("No analyst ID found")
            return
        }

        const currentUser = decodeToken(localStorage.getItem("token"))

        const response = await http.get(`/users/analysts/${analystId}`)
        const analyst = response.results

        renderAnalyst(analyst, currentUser)

        recommendationsPaginator.setEndpoint(
            `/recommendations/analyst/${analystId}`
        )

        await recommendationsPaginator.load()

        recommendationsPaginator.bind({
            nextBtn: document.getElementById("ana-next-btn"),
            prevBtn: document.getElementById("ana-prev-btn")
        })

    } catch (err) {
        console.error("Analyst Detail Error:", err)
    }
}

// =====================
// RENDER ANALYST HEADER
// =====================
function renderAnalyst(analyst, currentUser) {
    const container = document.getElementById("analyst-detail")
    if (!container) return

    const isSelf =
        currentUser && Number(currentUser.id) === Number(analyst.id)

    container.innerHTML = `
        <button id="back-btn" class="btn-back">Back</button>

        <div class="asset-header">
            <h1>${analyst.name}</h1>
            <p>Company: ${analyst.company}</p>
            <p>Biographie: ${analyst.bio}</p>

            <button id="follow-btn" ${isSelf ? "disabled" : ""}>
                ${isSelf ? "Your Profile" : "Follow Analyst"}
            </button>
        </div>
    `

    document.getElementById("back-btn")
        .addEventListener("click", () => history.back())

    if (!isSelf) {
        bindFollowButton(analyst.id)
    }
}

// =====================
// FOLLOW LOGIC
// =====================
function bindFollowButton(analystId) {
    const btn = document.getElementById("follow-btn")
    if (!btn) return

    btn.addEventListener("click", async () => {
        try {
            btn.disabled = true

            await http.post(`/users/me/follows/users/${analystId}`)

            btn.textContent = "Following"

        } catch (err) {
            if (err.status === 409) {
                btn.textContent = "Following"
            } else {
                btn.textContent = "Follow"
            }
        } finally {
            btn.disabled = false
        }
    })
}

// =====================
// RENDER RECOMMENDATIONS
// =====================
function renderRecommendations(recs, payload, meta) {
    const container = document.getElementById("analyst-recommendation-container")
    const paginationDiv = document.getElementById("analyst-pagination")

    if (!container) return

    if (!recs?.length) {
        container.innerHTML = "<p>No recommendations yet</p>"
        paginationDiv.style.display = "none"
        return
    }

    container.innerHTML =
        `<h3 id="reco-title">Recommendations</h3>` +
        recs.map(rec => `
            <div class="recommendation" data-ticker="${rec.ticker}" data-type="asset">
                <strong>${rec.status}</strong>
                <p>${rec.name}</p>
                <p>${rec.comment}</p>
                <p><small>${formatDate(rec.created_at)}</small></p>
            </div>
        `).join("")

    container.querySelectorAll(".recommendation").forEach(el => {
        el.style.cursor = "pointer"

        el.addEventListener("click", () => {
            const { ticker, type } = el.dataset
            window.location.hash = `#/details?type=${type}&ticker=${ticker}`
        })
    })

    if (paginationDiv) {
        paginationDiv.style.display =
            recs.length === 0 && (!meta || meta.offset === 0)
                ? "none"
                : "flex"
    }
}

