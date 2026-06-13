import http from "../../config/instanceHttp.js"
import { createPaginator } from "../../utils/pagination.js"
import { formatDate } from "../../utils/format.js";

const analystdetails = `
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

export default analystdetails

const renderRecommendations = (recs, payload, meta) => {
    const container = document.getElementById("analyst-recommendation-container")
    const paginationDiv = document.getElementById("analyst-pagination")

    if (!container) return
    container.innerHTML = recs.length > 0
        ? `<h3 id="reco-title">Recommendations</h3>` + recs.map(rec => `
            <div class="recommendation" data-ticker="${rec.ticker}"
            data-type="asset">
                <strong>${rec.status}</strong>
                <p>${rec.name}</p>
                <p>${rec.comment}</p>
                <p><small>Published on ${formatDate(rec.created_at)}</small></p>
            </div>`).join("")
        : "<p>No recommendations yet</p>"

        container.querySelectorAll('.recommendation').forEach(el => {
            el.style.cursor = 'pointer';
            el.onclick = () => {
                const { ticker, type } = el.dataset
                window.location.hash = `#/details?type=${type}&ticker=${ticker}`
            }
        })

    if (paginationDiv) {
        paginationDiv.style.display = (recs.length === 0 && (!meta || meta.offset === 0)) ? "none" : "flex";
    }
}

const recommendationsPaginator = createPaginator({
    endpoint: `/recommendations/analyst`,
    limit: 3,
    render: renderRecommendations,
    mapResponse: (res) => ({
        results: res.results,
        hasNext: res.hasNext 
    })
})

export async function initAnalystDetail() {

    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const analystId = params.get("id");

    if (!analystId) {
        console.error("Erreur : Aucun ID d'analyste trouvé dans l'URL");
        return;
    }

    try {
        const response = await http.get(`/users/analysts/${analystId}`)
        const analyst = response.results

        const container = document.getElementById("analyst-detail")
        if (!container) return

        container.innerHTML = `
            <button onclick="history.back()" class="btn-back">Back</button>
            <div class="asset-header">
                <h1>${analyst.name}</h1>
                <p>Company: ${analyst.company}</p>
                <p>Biographie: ${analyst.bio}</p>
                <button id="follow-btn">Follow Analyst</button>
            </div>
        `
        // FOLLOW
        document.getElementById("follow-btn").addEventListener("click", async (e) => {
            await http.post(`/users/me/follows/analyst/${analystId}`)
            e.target.textContent = "Following"
            e.target.disabled = true
        })
        // PAGINATION
        recommendationsPaginator.setEndpoint(`/recommendations/analyst/${analystId}`)
        await recommendationsPaginator.load()

        recommendationsPaginator.bind({
            nextBtn: document.getElementById("ana-next-btn"),
            prevBtn: document.getElementById("ana-prev-btn")
        })

    } catch (error) {
        console.error("Analyst Error:", error)
    }
}


