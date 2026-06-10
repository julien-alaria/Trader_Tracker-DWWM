import http from "../../config/instanceHttp.js"
import { decodeToken } from "../../middlewares/roleGuard.js"
import stockCard from "../../components/cards/stockCards.js"
import { getStock, getForex, getCommodities } from "../../utils/assetsUtils.js"
import analystUpdateForm from "../../components/user/analystUpdateForm.js"
import { enableCarouselWindow } from "../../utils/lazyloading.js"

const adminPage = `
    <main>
        <h1>ADMIN PAGE</h1>

        <section>
            <div id="admin_name"></div>
            <div id="admin_id"></div>
            <div id="admin_email"></div>
        </section>

        <section>
            <h2>Watchlist</h2>
            <div class="carousel" id="watchlist"></div>
        </section>

        <section>
            <h2>All Recommendations</h2>
            <div id="all-recommendations"></div> 
        </section>

        <section>
            <h2 id="admin-users-title">Gestion des Utilisateurs</h2>
            <div id="users-list"></div>
        </section>
    
        <section class="update-form">
            ${analystUpdateForm()}
        </section>
    </main>
`
export default adminPage

export async function initAdmin() {
    try {
        const token = localStorage.getItem("token")
        if (!token) return

        const payload = decodeToken(token)
        if (!payload) {
            window.location.hash = "/login"
            return
        }
        
        const [userRes, allUsersRes, watchRes, recommendationsRes, stocks, forex, commodities] = await Promise.all([
            http.get("/users/me"),
            http.get("/users"),
            http.get("/users/me/watchlist"),
            http.get("/recommendations"),
            getStock(),
            getForex(),
            getCommodities()
        ])

        const user = userRes.result
        renderAdmin(user)

        const allAssets = [...stocks, ...forex, ...commodities]
        const watchlist = buildWatchlist(watchRes.result, allAssets)
        renderWatchlist(watchlist)

        const allUsers = allUsersRes.results
        renderUserList(allUsers)

        const allRecommendations = recommendationsRes.results
        console.log("ALL RECOMMENDATIONS", allRecommendations)
        renderRecommendations(allRecommendations || [], payload) 
        //Payload contains the role
        bindRecommendationEvents(payload)
        initForm(user)
        bindNavigation()
    
    } catch (err) {
        console.error("ADMIN INIT ERROR:", err)
    }
}

function renderAdmin(user) {
    const map = {
        admin_id: user.id,
        admin_name: user.name,
        admin_email: user.email,
    }

    Object.entries(map).forEach(([id, value]) => {
        const el = document.getElementById(id)
        if (el) el.textContent = value ?? "N/A"
    })
}

function renderWatchlist(watchlist) {
    const container = document.getElementById("watchlist")
    if (!container) return

    if (!watchlist.length) {
        container.innerHTML = "<p>No favorites yet</p>"
        return
    }

    enableCarouselWindow({
        selector: "#watchlist",
        batchSize: 5,
        getData: () => watchlist, 
        cardComponent: stockCard  
    })
}

function buildWatchlist(raw, assets) {
    return raw.map(w => {
        const asset = assets.find(a => a.ticker === w.ticker)
        return { ...w, ...asset, isFollowed: true }
    })
}

function renderUserList(users) {
    const container = document.getElementById("users-list")
    container.innerHTML = users.map(user => `
        <div class="user-item">
            <span>${user.name} (${user.role})</span>
            <button onclick="editUser('${user.id}')">Éditer</button>
            <button onclick="deleteUser('${user.id}')" class="delete">Supprimer</button>
        </div>
    `).join("")
}

// fill form
window.editUser = async (id) => {
    const res = await http.get(`/users/${id}`)
    const user = res.result 
    
    // fill analystUpdateForm
    document.getElementById("analyst-name").value = user.name
    document.getElementById("analyst-email").value = user.email
    document.getElementById("analyst-company").value = user.company || ""
    document.getElementById("analyst-bio").value = user.bio || ""
    document.getElementById("target-user-id").value = user.id 
    
    // Scroll to form
    document.querySelector(".update-form").scrollIntoView({ behavior: 'smooth' })
}

window.deleteUser = async (id) => {
    const btn = document.querySelector(`button[data-id="${id}"]`)
    // Temporary button transformation
    btn.innerHTML = "Confirmer ?"
    btn.onclick = async () => {
        await http.delete(`/users/${id}`)
        initAdmin()
    }
}

function renderRecommendations(recommendations, user) {
    const container = document.getElementById("all-recommendations")
    
    container.innerHTML = recommendations.map(rec => {
        // The admin sees everything, and we can display a different label
        // depending on whether it's their own recommendation or someone else's
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
            
            <button class="delete-btn" data-id="${rec.id}">DELETE</button>
            
            <form class="edit-form hidden" data-id="${rec.id}">
                <select name="status">
                    <option value="BUY" ${rec.status === 'BUY' ? 'selected' : ''}>BUY</option>
                    <option value="SELL" ${rec.status === 'SELL' ? 'selected' : ''}>SELL</option>
                    <option value="HOLD" ${rec.status === 'HOLD' ? 'selected' : ''}>HOLD</option>
                </select>
                <input name="comment" value="${rec.comment}" placeholder="Commentaire" required />
                <button type="submit">EDIT</button>
            </form>
        </div>
        `
    }).join("")
}

function bindRecommendationEvents(user) {
    const container = document.getElementById("all-recommendations")
    if (!container) return

    container.addEventListener("click", async (e) => {
        if (e.target.classList.contains("delete-btn")) {
            const id = e.target.dataset.id
            const card = e.target.closest(".recommendation")
            try {
                await http.delete(`/recommendations/${id}`)
                card.remove()
            } catch (err) {
                console.error("DELETE ERROR:", err)
            }
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
            const updated = await http.get("/recommendations")
            renderRecommendations(updated.results || [], user)
        } catch (err) {
            console.error("UPDATE ERROR:", err)
        }
    })
}

function bindNavigation() {
    const watchlistContainer = document.getElementById("watchlist")
    if (watchlistContainer) {
        // A single listener on the container catches clicks from all current or future cards
        watchlistContainer.addEventListener("click", (e) => {
            const card = e.target.closest(".card")
            if (card) {
                const { ticker, type } = card.dataset
                window.location.hash = `#/details?type=${type}&ticker=${ticker}`
            }
        })
    }
}

function initForm(user) {
    const form = document.getElementById("analyst-update-form")
    if (!form) return

    form.addEventListener("submit", async (e) => {
        e.preventDefault()
        const data = new FormData(form)
        const targetId = data.get("target_user_id") //hidden ID
        
        const payload = {
            name: data.get("name"),
            email: data.get("email"),
            company: data.get("company"),
            bio: data.get("bio")
        }
        
        const url = targetId ? `/users/${targetId}` : "/users/me"
        
        try {
            console.log("URL:", url)
            console.log("PAYLOAD", payload)
            await http.put(url, payload)
            alert("Profil mis à jour !")
            initAdmin()
        } catch (err) {
            console.error("UPDATE ERROR:", err)
        }
    })
}



