import Home from "./pages/home.js"
import about from "./pages/about.js"
import login, { initLogin } from "./pages/login.js"
import home from "./pages/home.js";
import notfound from "./pages/notfound.js"

function router() {
    const hash = window.location.hash.slice(1) || "/";

    let content = "";

    switch (hash) {
        case "/":
            content = home;
            break;
        case "/about":
            content = about;
            break;
        case "/login":
            content = login;
            break;
        case "/admin":
            content = admin;
            break;
        default:
            content = notfound;
    }
    document.getElementById("app").innerHTML = content;

    if (hash === "/login") {
        initLogin();
    }
}

window.addEventListener("hashchange", router);
window.addEventListener("load", router);