import { createPaginator } from "../../utils/pagination.js"

export function createPaginationList({ targetSelector, prefix, endpoint, itemTemplate, buildUrl }) {
  const target = document.querySelector(targetSelector)
  if (!target) return null

  const containerId = `${prefix}-list-container`
  const paginationId = `${prefix}-pagination`
  const prevBtnId = `${prefix}-prev-btn`
  const nextBtnId = `${prefix}-next-btn`

  target.innerHTML = `
      <div id="${containerId}"></div>
      <div id="${paginationId}" style="display: none; gap: 10px; margin-top: 10px;">
          <button id="${prevBtnId}">Previous</button>
          <button id="${nextBtnId}">Next</button>
      </div>
  `

  const paginator = createPaginator({
      endpoint: endpoint,
      limit: 5,
      render: (results) => {
          const container = document.getElementById(containerId);
          if (container) container.innerHTML = results.map(item => itemTemplate(item)).join("")
      },
      mapResponse: (res) => {
          const wrapper = document.getElementById(paginationId)
          if (wrapper) {
              wrapper.style.display = (res.results && res.results.length > 0) ? "flex" : "none"
          }
          return { results: res.results, hasNext: res.hasNext }
      }
  })

  target.addEventListener("click", (e) => {
      if (e.target.id === nextBtnId) {
          paginator.next();
          return
      } 
      if (e.target.id === prevBtnId) {
          paginator.prev();
          return
      }

      if (e.target.closest(".delete-btn") || e.target.closest(".edit-form")) {
          return
      }

      const item = e.target.closest("[data-js-clickable]");
      if (item) {
          window.location.hash = buildUrl(item.dataset);
      }
  })

  return paginator
}

export function createLocalPaginationList({
  targetSelector,
  prefix,
  data,
  limit = 10,
  itemTemplate,
  buildUrl }) {

  const target = document.querySelector(targetSelector)
  if (!target || !data) return null

  const containerId = `${prefix}-list-container`
  const paginationId = `${prefix}-pagination`
  const prevBtnId = `${prefix}-prev-btn`
  const nextBtnId = `${prefix}-next-btn`

  target.innerHTML = `
        <div id="${containerId}"></div>
        <div id="${paginationId}" style="display: none; gap: 10px; margin-top: 10px;">
            <button id="${prevBtnId}">Previous</button>
            <button id="${nextBtnId}">Next</button>
        </div>
    `

  let currentPage = 0
  const container = document.getElementById(containerId)
  const paginationDiv = document.getElementById(paginationId)

  const updateView = () => {
    const start = currentPage * limit
    const pageData = data.slice(start, start + limit)

    if (!pageData.length) {
      container.innerHTML = "<p>No assets available</p>"
      if (paginationDiv) paginationDiv.style.display = "none"
      return
    }

    container.innerHTML = pageData.map((item) => itemTemplate(item)).join("")

    const prevBtn = document.getElementById(prevBtnId)
    const nextBtn = document.getElementById(nextBtnId)
    if (prevBtn) prevBtn.disabled = currentPage === 0
    if (nextBtn) nextBtn.disabled = start + limit >= data.length

    if (paginationDiv) {
      paginationDiv.style.display = data.length > limit ? "flex" : "none"
    }
    
  }

  target.addEventListener("click", (e) => {
  
    if (e.target.id === nextBtnId) {
      currentPage++
      updateView()
    } else if (e.target.id === prevBtnId) {
      currentPage--
      updateView()
    } 

    else {
      const item = e.target.closest("[data-js-clickable]")
      if (item) {
        window.location.hash = buildUrl(item.dataset)
      }
    }
  })

  // Initial render
  updateView()

  return {
    load: async () => updateView()
  }
}