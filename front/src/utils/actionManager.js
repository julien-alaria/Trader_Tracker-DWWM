import http from "../config/instanceHttp.js";

export function bindRecommendationActions(targetSelector, paginatorInstance) {
  const container = document.querySelector(targetSelector);
  if (!container) return;

  // 1. Intercepteur de clics (DELETE)
  container.addEventListener("click", async (e) => {
    if (!e.target.classList.contains("delete-btn")) return;
    
    const id = e.target.dataset.id;
    if (!id) return;

    try {
      await http.delete(`/recommendations/${id}`);
      if (paginatorInstance) await paginatorInstance.load();
    } catch (err) {
      console.error("CRITICAL DELETE ERROR:", err);
    }
  });

  // 2. Intercepteur de soumission (EDIT)
  container.addEventListener("submit", async (e) => {
    if (!e.target.classList.contains("edit-form")) return;
    e.preventDefault();

    const id = e.target.dataset.id;
    const data = new FormData(e.target);
    if (!id) return;

    try {
      await http.put(`/recommendations/${id}`, {
        status: data.get("status"),
        comment: data.get("comment"),
      });
      if (paginatorInstance) await paginatorInstance.load();
    } catch (err) {
      console.error("CRITICAL UPDATE ERROR:", err);
    }
  });
}