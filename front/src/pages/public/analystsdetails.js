import { API_BASE_URL } from "../../config/api.js"
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

        if (currentUser) {
            const checkFollow = await http.get(`/users/me/follows/users/${analystId}/check`)
            analyst.isFollowing = checkFollow.isFollowing // Injecte true ou false dans l'objet
        } else {
            analyst.isFollowing = false
        }

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

    const isSelf = currentUser && Number(currentUser.id) === Number(analyst.id)
    
    const initialText = analyst.isFollowing ? "⭐ Unfollow Analyst" : "☆ Follow Analyst"

    const defaultAvatar = "/assets/default_analyst.png"
    const imageUrl = analyst.picture ? `${API_BASE_URL}/uploads/${analyst.picture}` : defaultAvatar

    container.innerHTML = `
        <button id="back-btn" class="btn-back">Back</button>

        <div class="asset-header">
        <div class="analyst-avatar-container">
                <img src="${imageUrl}" alt="Photo de ${analyst.name}" class="analyst-profile-pic" />
            </div>
            
            <h1>${analyst.name}</h1>
            <p>Company: ${analyst.company}</p>
            <p>Biographie: ${analyst.bio}</p>

            <button id="follow-btn" ${isSelf ? "disabled" : ""} data-followed="${analyst.isFollowing}">
                ${isSelf ? "Your Profile" : initialText}
            </button>
        </div>
    `

    document.getElementById("back-btn")
        .addEventListener("click", () => history.back())

    if (!isSelf) {
        // Plus besoin de passer l'état initial en paramètre, le dataset s'en charge !
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
        // 1. On récupère l'état actuel directement depuis le dataset du bouton
        const isFollowing = btn.dataset.followed === "true"
        btn.disabled = true

        try {
            if (isFollowing) {
                // ---- LOGIQUE UNFOLLOW ----
                await http.delete(`/users/me/follows/users/${analystId}`)
                
                // Mise à jour du dataset et du texte en cas de succès
                btn.dataset.followed = "false"
                btn.textContent = "☆ Follow Analyst"
            } else {
                // ---- LOGIQUE FOLLOW ----
                await http.post(`/users/me/follows/users/${analystId}`)
                
                // Mise à jour du dataset et du texte en cas de succès
                btn.dataset.followed = "true"
                btn.textContent = "⭐ Unfollow Analyst"
            }
        } catch (err) {
            console.error("Follow/Unfollow error:", err)
            alert("Impossible de mettre à jour le suivi.")
        } finally {
            btn.disabled = false
        }
    })
}

// =====================
// RENDER RECOMMENDATIONS
// =====================
function renderRecommendations(recs, meta) {
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
        recs.map(rec => {
            const defaultAvatar = "/assets/logo/nasdaq_logo.png"
            const imageUrl = `/assets/logos/${rec.ticker.toLowerCase()}.svg` || defaultAvatar

            let recoImage

            if (rec.status === "BUY") {
                recoImage = "/assets/arrows/up-green.svg";
            } else if (rec.status === "SELL") {
                recoImage = "/assets/arrows/down-red.svg";
            } else {
                recoImage = "/assets/arrows/medium-blue.svg";
            }

        return `
            <div class="recommendation" data-ticker="${rec.ticker}" data-type="asset">
                <img src="${recoImage}" style="width: 50px; height: 50px; object-fit: contain;" alt="reco-image" />
                <strong>${rec.status}</strong>
                <img src="${imageUrl}" style="width: 50px; height: 50px; object-fit: contain;" alt="analyst-picture" />
                <p>${rec.name}</p>
                <p>${rec.comment}</p>
                <p><small>${formatDate(rec.created_at)}</small></p>
            </div>
        `
    }).join("")

    container.querySelectorAll(".recommendation").forEach(el => {
        el.style.cursor = "pointer"

        el.addEventListener("click", () => {
            const { ticker, type } = el.dataset
            window.location.hash = `#/details?type=${type}&ticker=${ticker}`
        })
    })

    if (paginationDiv) {
        paginationDiv.style.display =
            recs.length === 0 && (!meta || meta.offset === 0) ? "none" : "flex"
    }
}

