export function bindLogoutEvent() {
    document.addEventListener("click", (e) => {
        if (e.target && e.target.id === "logout-btn") {
            localStorage.removeItem("token")
            window.location.hash = "/"
 
            window.location.reload()
        }
    }, { once: true }) // 'once: true' avoids listeners duplication
}