import { API_BASE_URL } from "../../config/api.js"

export default function analystCard({ id, name, company, bio, picture } = {}) {
    
    const defaultAvatar = "/assets/analyst/default_analyst.png"
    const imageUrl = picture ? `${API_BASE_URL}/uploads/${picture}` : defaultAvatar

    // Avoid visibles NULL
    const displayName = name ?? "Analyst"
    const displayCompany = company ?? "Independent Analyst"
    const displayBio = bio ? bio.substring(0, 50) + '...' : 'No bio available.'

    return `
        <div class="card analyst" data-id="${id ?? ''}">

            <img class="card-image-analyst" src="${imageUrl}" alt="${displayName}">

            <h2 class="card-title">${displayName}</h2>

            <p class="card-text">${displayCompany}</p>

            <p class="card-text">${displayBio}</p>

        </div>
    `
}

                                                                                                                                                        