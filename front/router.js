import Home from "./src/pages/public/home.js";
import about from "./src/pages/public/about.js";
import register, { initRegister } from "./src/pages/auth/register.js";
import login, { initLogin } from "./src/pages/auth/login.js";
import home from "./src/pages/public/home.js";
import notfound from "./src/pages/public/notfound.js";

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
    case "/register":
      content = register;
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
  document.getElementById("root").innerHTML = content;

  if (hash === "/login") {
    initLogin();
  }
}

window.addEventListener("hashchange", router);
window.addEventListener("load", router);
