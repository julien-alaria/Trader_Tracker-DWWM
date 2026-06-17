import http from "../../config/instanceHttp.js"
import { decodeToken } from "../../middlewares/roleGuard.js"
import analystUpdateForm from "../../components/forms/analystUpdateForm.js"
import { createPaginationList } from "../../components/pagination/PaginationComponent.js"
import { bindRecommendationActions } from "../../utils/actionManager.js"

// =====================
// TEMPLATE HTML (Structure épurée, gérée par le composant externe)
// =====================
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
        <div id="pending-analysts"></div>
    </section>

    <section>
        <h2>All Recommendations</h2>
        <div id="recommendations-list-target"></div>
    </section>

    <section>
        <h2 id="admin-users-title">Gestion des Utilisateurs</h2>
        <div id="users-list-target"></div>
    </section>

    <section class="update-form">
        ${analystUpdateForm()}
    </section>
</main>
`;
export default adminPage;

// Variables globales pour stocker les instances de pagination
let recommendationsPaginator = null;
let usersPaginator = null;

// =====================
// INIT
// =====================
export async function initAdmin() {
    try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const payload = decodeToken(token);
        if (!payload) {
            window.location.hash = "/login";
            return;
        }

        const [userRes] = await Promise.all([
            http.get("/users/me")
        ]);

        const user = userRes.result;
        renderAdmin(user);

        // --------------------------------------------------
        // RENDER DES PAGINATIONS (DÉLÉGUÉ AUX COMPOSANTS)
        // --------------------------------------------------

        // 1. ALL RECOMMENDATIONS PAGINATOR
        recommendationsPaginator = createPaginationList({
            targetSelector: "#recommendations-list-target",
            prefix: "recommendations",
            endpoint: "/recommendations",
            itemTemplate: (rec) => {
                const isMine = Number(user.id) === Number(rec.user_id);

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
                `;
            },
            // Pas de redirection globale nécessaire ici au clic de la ligne
            buildUrl: () => "" 
        });

        // 2. USERS LIST PAGINATOR
        usersPaginator = createPaginationList({
            targetSelector: "#users-list-target",
            prefix: "users",
            endpoint: "/users",
            itemTemplate: (u) => `
                <div class="user-item">
                    <span>${u.name} (${u.role})</span>
                    <button class="edit-user-btn" data-id="${u.id}">Éditer</button>
                    <button class="delete-user-btn" data-id="${u.id}">Supprimer</button>
                </div>
            `,
            buildUrl: () => ""
        });

        // Lancement initial des chargements asynchrones
        await usersPaginator.load();
        await recommendationsPaginator.load();
        await loadPendingAnalysts();

        // Liaison des écouteurs d'événements métiers locaux
        bindRecommendationActions("#recommendations-list-target", recommendationsPaginator);
        bindUserListEvents();
        initForm(user);

    } catch (err) {
        console.error("ADMIN INIT ERROR:", err);
    }
}

// =====================
// RENDER ADMIN INFO
// =====================
function renderAdmin(user) {
    const map = {
        admin_id: user.id,
        admin_name: user.name,
        admin_email: user.email
    };

    Object.entries(map).forEach(([id, value]) => {
        const el = document.getElementById(id);
        if (el) el.textContent = value ?? "N/A";
    });
}

// =====================
// PENDING ANALYSTS
// =====================
async function loadPendingAnalysts() {
    const container = document.getElementById("pending-analysts");
    if (!container) return;

    try {
        const res = await http.get("/users/pending-analysts"); 
        const pendingAnalysts = res.results;

        if (!pendingAnalysts || pendingAnalysts.length === 0) {
            container.innerHTML = `<p class="no-data">🎉 Aucun analyste en attente de validation.</p>`;
            return;
        }

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
        `;

        container.querySelectorAll(".approve-btn").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                const id = e.target.dataset.id;
                e.target.disabled = true;

                try {
                    await http.put(`/users/${id}`, { analyst_verified: 1 });
                    alert("Analyste approuvé avec succès !");
                    await loadPendingAnalysts();
                    if (usersPaginator) await usersPaginator.load();
                } catch (err) {
                    console.error("APPROVE ANALYST ERROR:", err);
                    alert("Erreur lors de la validation.");
                    e.target.disabled = false;
                }
            });
        });

    } catch (err) {
        console.error("LOAD PENDING ANALYSTS ERROR:", err);
        container.innerHTML = `<p style="color: red;">Erreur lors du chargement des demandes.</p>`;
    }
}

// =====================
// EVENTS ON RECOMMENDATIONS (INTERCEPTEURS LOCALISÉS)
// =====================
function bindRecommendationEvents() {
    const container = document.getElementById("recommendations-list-target");
    if (!container) return;

    container.addEventListener("click", async (e) => {
        if (!e.target.classList.contains("delete-btn")) return;

        try {
            await http.delete(`/recommendations/${e.target.dataset.id}`);
            await recommendationsPaginator.load();
        } catch (err) {
            console.error("DELETE ERROR:", err);
        }
    });

    container.addEventListener("submit", async (e) => {
        if (!e.target.classList.contains("edit-form")) return;
        e.preventDefault();

        const id = e.target.dataset.id;
        const data = new FormData(e.target);

        try {
            await http.put(`/recommendations/${id}`, {
                status: data.get("status"),
                comment: data.get("comment")
            });
            await recommendationsPaginator.load();
        } catch (err) {
            console.error("UPDATE ERROR:", err);
        }
    });
}

// =====================
// GESTION DES CLICS USERS (Remplace les fonctions globales du window)
// =====================
function bindUserListEvents() {
    const container = document.getElementById("users-list-target");
    if (!container) return;

    container.addEventListener("click", async (e) => {
        // Cas 1 : Clic sur Éditer
        if (e.target.classList.contains("edit-user-btn")) {
            const id = e.target.dataset.id;
            try {
                const res = await http.get(`/users/${id}`);
                const u = res.result;

                document.getElementById("analyst-name").value = u.name;
                document.getElementById("analyst-email").value = u.email;
                document.getElementById("analyst-company").value = u.company || "";
                document.getElementById("analyst-bio").value = u.bio || "" ;
                document.getElementById("target-user-id").value = u.id;

                document.querySelector(".update-form").scrollIntoView({ behavior: "smooth" });
            } catch (err) {
                console.error("EDIT USER ERROR:", err);
            }
            return;
        }

        // Cas 2 : Clic sur Supprimer
        if (e.target.classList.contains("delete-user-btn")) {
            const id = e.target.dataset.id;
            try {
                await http.delete(`/users/${id}`);
                await usersPaginator.load(); // Refresh auto
            } catch (err) {
                console.error("DELETE USER ERROR:", err);
            }
        }
    });
}

// =====================
// INIT FORM PROFILE / COMPTE
// =====================
function initForm(user) {
    const form = document.getElementById("analyst-update-form");
    if (!form) return;

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const data = new FormData(form);
        const targetId = data.get("target_user_id");

        const payload = {
            name: data.get("name"),
            email: data.get("email"),
            company: data.get("company"),
            bio: data.get("bio")
        };

        const url = targetId ? `/users/${targetId}` : "/users/me";

        try {
            await http.put(url, payload);
            alert("Profil mis à jour !");
            initAdmin();
        } catch (err) {
            console.error("UPDATE ERROR:", err);
        }
    });
}