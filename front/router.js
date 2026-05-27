import home, { initHome } from "./src/pages/public/home.js";
import about from "./src/pages/public/about.js";
import register, { initRegister } from "./src/pages/auth/register/register.js";
import analystRegister, {
  initAnalystRegister,
} from "./src/pages/auth/register/analystRegister.js";
import login, { initLogin } from "./src/pages/auth/login.js";

import { roleGuard } from "./src/middlewares/roleGuard.js";

import userPage, { initUser } from "./src/pages/user/user.js"
import analystPage, { initAnalyst }  from "./src/pages/analyst/analyst.js"
import adminPage, { initAdmin } from "./src/pages/admin/admin.js"

import notfound from "./src/pages/public/notfound.js";
import navbar from "./src/components/navbar/navbar.js";
import footer from "./src/components/footer/footer.js";

function router() {
  const hash = window.location.hash.slice(1) || "/";

  let content = "";
  let init = null;

  switch (hash) {
    case "/":
      content = home
      init = initHome
      break;

    case "/about":
      content = about
      break;

    case "/register":
      content = register
      init = initRegister
      break;

    case "/analystregister":
      content = analystRegister
      init = initAnalystRegister
      break;

    case "/login":
      content = login
      init = initLogin
      break

    case "/user":
      if (!roleGuard(["user"])) return
      content = userPage
      init = initUser
      break

    case "/admin":
      if (!roleGuard(["admin"])) return
      content = adminPage
      init = initAdmin 
      break

    case "/analyst":
      if (!roleGuard(["analyst"])) return
      content = analystPage
      init = initAnalyst
      break

    default:
      content = notfound;
  }

  document.getElementById("root").innerHTML = content;

  if (init) {
    init();
  }
}

document.getElementById("nav").innerHTML = navbar();
document.getElementById("foot").innerHTML = footer();

window.addEventListener("hashchange", router);
window.addEventListener("load", router);
