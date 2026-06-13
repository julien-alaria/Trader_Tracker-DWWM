export default function analystCard({ id, name, company, bio, image = '/assets/default_analyst.png'} = {}) {
    return `
    <div class="card analyst" data-id="${id}">
        <img class="card-image" src="${image}" alt="${name}">
        <h2 class="card-title">${name}</h2>
        <p class="card-subtitle">${company}</p>
        <p class="card-description">
            ${bio ? bio.substring(0, 50) + '...' : 'No bio available.'}
        </p>
    </div>
    `
}


