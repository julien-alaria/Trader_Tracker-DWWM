// front/src/pages/detailAnalyst.js
import http from "../../config/instanceHttp.js";
import { createPaginator } from "../../utils/pagination.js"

const analystDetailsPage = `
    <main>
        <section id="detail-section">
            <h1>Analyst Details Page</h1>
        </section>

        <section>
            <div id="analyst_id"></div>
            <div id="analyst_name"></div>
            <div id="analyst_email"></div>
            <div id="analyst_type"></div>
            <div id="analyst_company"></div>
            <div id="analyst_bio"></div>
        </section>

         <section>
            <h2>My Recommendations</h2>
            <div id="my-recommendations"></div>

            <div id="pagination">
                <button id="prev-btn">Previous</button>
                <button id="next-btn">Next</button>
            </div>
        </section>
  
    </main>
`

export default analystDetailsPage


export async function initDetailAnalyst(analystId) {
    try {
        const analyst = await http.get(`/users/analysts/${analystId}`);
        const container = document.getElementById("analyst-detail-container");
        
        container.innerHTML = `
            <div class="analyst-profile">
                <img src="${analyst.image || '/assets/default_analyst.png'}" alt="${analyst.name}">
                <h1>${analyst.name}</h1>
                <p><strong>Company:</strong> ${analyst.company}</p>
                <p>${analyst.bio}</p>
                
                <button id="follow-btn" data-id="${analyst.id}">Follow Analyst</button>
            </div>
        `

        await recommendationsPaginator.load()

        // Logique de follow isolée ici
        document.getElementById("follow-btn").addEventListener("click", async (e) => {
            const id = e.target.dataset.id;
            await http.post(`/users/me/follows/analyst/${id}`)
            // Mise à jour visuelle du bouton
        })

        recommendationsPaginator.bind({
        nextBtn: document.getElementById("next-btn"),
        prevBtn: document.getElementById("prev-btn")
        })

    } catch (err) {
        console.error("Erreur chargement analyste:", err)
    }
}

 const renderRecommendations = (recs, payload, meta) => {
            const container = document.getElementById("my-recommendation");
            const paginationDiv = document.getElementById("pagination")

            if (!paginationDiv) return; // Sécurité

            container.innerHTML = recs.length > 0
                ? `<h3 id="reco-title">Analysts Recommendations</h3>` + recs.map(rec => `
                    <div class="recommendation">
                        <strong>${rec.status}</strong>
                        <p>${rec.comment}</p>
                        <p>Analyst: ${rec.analyst_name ?? "unknown"}</p>
                        <p>Published on ${formatDate(rec.created_at)}</p>
                    </div>`).join("")
                : "<p>No recommendations yet</p>"

            if (recs.length === 0 && (!meta || meta.offset === 0)) {
                paginationDiv.style.display = "none"
            } else {
                paginationDiv.style.display = "flex"
            }
        }


// PAGINATORS
const recommendationsPaginator = createPaginator({
    endpoint: "/recommendations/analysts?${analystId}",
    limit: 10,
    render: renderRecommendations,
    mapResponse: (res) => ({
        results: res.results,
        hasNext: res.meta.hasNext
    })
})
