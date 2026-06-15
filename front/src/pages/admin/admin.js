import http from "../../config/instanceHttp.js"
import { decodeToken } from "../../middlewares/roleGuard.js"
import analystUpdateForm from "../../components/forms/analystUpdateForm.js"
import { createPaginator } from "../../utils/pagination.js"

let recommendationsPaginator
let usersPaginator

const adminPage = `
<main>
    <h1>ADMIN PAGE</h1>

    <section>
        <div id="admin_name"></div>
        <div id="admin_id"></div>
        <div id="admin_email"></div>
    </section>

    <section>
        <h2>ANALYST VALIDATION</h2>
        <div id="pending-analysts"></div> </section>
    </section>

    <section>
        <h2>All Recommendations</h2>
        <div id="all-recommendations"></div>

        <div id="pagination">
            <button id="prev-btn">Previous</button>
            <button id="next-btn">Next</button>
        </div>
    </section>

    <section>
        <h2 id="admin-users-title">Gestion des Utilisateurs</h2>

        <div id="users-list"></div>

        <div id="users-pagination">
            <button id="users-prev-btn">Previous</button>
            <button id="users-next-btn">Next</button>
        </div>
    </section>

    <section class="update-form">
        ${analystUpdateForm()}
    </section>
</main>
`

export default adminPage

// INIT
export async function initAdmin() {
    try {
        const token = localStorage.getItem("token")
        if (!token) return

        const payload = decodeToken(token)
        if (!payload) {
            window.location.hash = "/login"
            return
        }

        const [userRes] = await Promise.all([
            http.get("/users/me")
        ])

        const user = userRes.result
        renderAdmin(user)

        // PAGINATORS
        recommendationsPaginator = createPaginator({
            endpoint: "/recommendations",
            limit: 3,
            // Fix: Injection de l'utilisateur pour le rendu dynamique
            render: (data) => renderRecommendations(data, user),
            getPayload: () => decodeToken(localStorage.getItem("token")),
            mapResponse: (res) => res
        })

        usersPaginator = createPaginator({
            endpoint: "/users",
            limit: 3,
            render: renderUserList,
            getPayload: () => decodeToken(localStorage.getItem("token")),
            mapResponse: (res) => res
        })

        await usersPaginator.load()
        await recommendationsPaginator.load()
        await loadPendingAnalysts()

        usersPaginator.bind({
            nextBtn: document.getElementById("users-next-btn"),
            prevBtn: document.getElementById("users-prev-btn")
        })

        recommendationsPaginator.bind({
            nextBtn: document.getElementById("next-btn"),
            prevBtn: document.getElementById("prev-btn")
        })

        bindRecommendationEvents(user)
        initForm(user)

    } catch (err) {
        console.error("ADMIN INIT ERROR:", err)
    }
}

// RENDER ADMIN INFO
function renderAdmin(user) {
    const map = {
        admin_id: user.id,
        admin_name: user.name,
        admin_email: user.email
    }

    Object.entries(map).forEach(([id, value]) => {
        const el = document.getElementById(id)
        if (el) el.textContent = value ?? "N/A"
    })
}

// USERS
function renderUserList(users) {
    const container = document.getElementById("users-list")

    container.innerHTML = users.map(user => `
        <div class="user-item">
            <span>${user.name} (${user.role})</span>
            <button onclick="editUser('${user.id}')">Éditer</button>
            <button onclick="deleteUser('${user.id}')">Supprimer</button>
        </div>
    `).join("")
}

// RECOMMENDATIONS
function renderRecommendations(recommendations, user) {
    const container = document.getElementById("all-recommendations")

    container.innerHTML = recommendations.map(rec => {
        const isMine = Number(user.id) === Number(rec.user_id)

        return `
        <div class="recommendation" data-id="${rec.id}">
            <strong>${rec.status}</strong>
            <p>${rec.comment}</p>

            <div class="meta">
                <span>Analyst: <strong>${rec.analyst_name}</strong></span>
                ${isMine ? '<span class="badge">Me</span>' : ''}
            </div>

            <p>Asset: ${rec.name} (${rec.ticker})</p>

            <button class="delete-btn" data-id="${rec.id}">
                DELETE
            </button>

            <form class="edit-form hidden" data-id="${rec.id}">
                <select name="status">
                    <option value="BUY" ${rec.status === "BUY" ? "selected" : ""}>BUY</option>
                    <option value="SELL" ${rec.status === "SELL" ? "selected" : ""}>SELL</option>
                    <option value="HOLD" ${rec.status === "HOLD" ? "selected" : ""}>HOLD</option>
                </select>

                <input name="comment" value="${rec.comment}" required />

                <button type="submit">EDIT</button>
            </form>
        </div>
        `
    }).join("")
}

// EVENTS
function bindRecommendationEvents(user) {
    const container = document.getElementById("all-recommendations")
    if (!container) return

    container.addEventListener("click", async (e) => {
        if (!e.target.classList.contains("delete-btn")) return

        try {
            await http.delete(`/recommendations/${e.target.dataset.id}`)
            await recommendationsPaginator.load()
        } catch (err) {
            console.error("DELETE ERROR:", err)
        }
    })

    container.addEventListener("submit", async (e) => {
        if (!e.target.classList.contains("edit-form")) return

        e.preventDefault()

        const id = e.target.dataset.id
        const data = new FormData(e.target)

        try {
            await http.put(`/recommendations/${id}`, {
                status: data.get("status"),
                comment: data.get("comment")
            })

            await recommendationsPaginator.load()

        } catch (err) {
            console.error("UPDATE ERROR:", err)
        }
    })
}

// FORM
function initForm(user) {
    const form = document.getElementById("analyst-update-form")
    if (!form) return

    form.addEventListener("submit", async (e) => {
        e.preventDefault()

        const data = new FormData(form)
        const targetId = data.get("target_user_id")

        const payload = {
            name: data.get("name"),
            email: data.get("email"),
            company: data.get("company"),
            bio: data.get("bio")
        }

        const url = targetId ? `/users/${targetId}` : "/users/me"

        try {
            await http.put(url, payload)
            alert("Profil mis à jour !")
            initAdmin()
        } catch (err) {
            console.error("UPDATE ERROR:", err)
        }
    })
}

// GLOBAL USER ACTIONS
window.editUser = async (id) => {
    try {
        const res = await http.get(`/users/${id}`)
        const user = res.result

        document.getElementById("analyst-name").value = user.name
        document.getElementById("analyst-email").value = user.email
        document.getElementById("analyst-company").value = user.company || ""
        document.getElementById("analyst-bio").value = user.bio || ""
        document.getElementById("target-user-id").value = user.id

        document.querySelector(".update-form")
            .scrollIntoView({ behavior: "smooth" })

    } catch (err) {
        console.error("EDIT USER ERROR:", err)
    }
}

window.deleteUser = async (id) => {
    // Immediate deletion without a confirmation step
    try {
        await http.delete(`/users/${id}`);
        
        // Refresh the paginated list after deletion
        if (usersPaginator) {
            await usersPaginator.load();
        }
    } catch (err) {
        console.error("DELETE USER ERROR:", err);
    }
}

// PENDING ANALYSTS
async function loadPendingAnalysts() {
    const container = document.getElementById("pending-analysts")
    if (!container) return

    try {
        // 1. On appelle la route dédiée
        const res = await http.get("/users/pending-analysts") 
        const pendingAnalysts = res.results // C'est directement le tableau des analystes à valider !

        // 2. Si le tableau est vide, c'est qu'il n'y a personne à valider
        if (!pendingAnalysts || pendingAnalysts.length === 0) {
            container.innerHTML = `<p class="no-data">🎉 Aucun analyste en attente de validation.</p>`
            return
        }

        // 3. Rendu direct du tableau (pas de code de filtrage inutile ici)
        container.innerHTML = `
            <table class="admin-table">
                <thead>
                    <tr>
                        <th>Nom</th>
                        <th>Email</th>
                        <th>Entreprise</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    ${pendingAnalysts.map(analyst => `
                        <tr>
                            <td><strong>${analyst.name}</strong></td>
                            <td>${analyst.email}</td>
                            <td>${analyst.company || "N/A"}</td>
                            <td>
                                <button class="approve-btn" data-id="${analyst.id}">
                                    ✅ Approuver
                                </button>
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        `

        // Écouteur d'événements pour le bouton Approuver (inchangé)
        container.querySelectorAll(".approve-btn").forEach(btn => {
            // Dans la fonction front 'loadPendingAnalysts' :
            btn.addEventListener("click", async (e) => {
                const id = e.target.dataset.id
                e.target.disabled = true

                try {
                    // On envoie le corps attendu par ton modèle et ton sanitizer
                    await http.put(`/users/${id}`, { analyst_verified: 1 })
                    
                    alert("Analyste approuvé avec succès !")
                    await loadPendingAnalysts()
                    if (usersPaginator) await usersPaginator.load()
                } catch (err) {
                    console.error("APPROVE ANALYST ERROR:", err)
                    alert("Erreur lors de la validation.")
                    e.target.disabled = false
                }
            })
        })

    } catch (err) {
        console.error("LOAD PENDING ANALYSTS ERROR:", err)
        container.innerHTML = `<p style="color: red;">Erreur lors du chargement des demandes.</p>`
    }
}