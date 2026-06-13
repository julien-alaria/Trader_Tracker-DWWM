import home, { initHome } from "./src/pages/public/home.js"
import list, { initList } from "./src/pages/public/list.js"
import about from "./src/pages/public/about.js"
import register, { initRegister } from "./src/pages/auth/register/register.js"
import analystRegister, { initAnalystRegister } from "./src/pages/auth/register/analystRegister.js"
import login, { initLogin } from "./src/pages/auth/login.js"
import detailsPage, { initDetail} from "./src/pages/public/assetsdetails.js"
import analystDetailsPage, { initDetailAnalyst } from "./src/pages/public/analystsdetails.js"

import { roleGuard } from "./src/middlewares/roleGuard.js"

import userPage, { initUser } from "./src/pages/user/user.js"
import analystPage, { initAnalyst }  from "./src/pages/analyst/analyst.js"
import adminPage, { initAdmin } from "./src/pages/admin/admin.js"

import notfound from "./src/pages/public/notfound.js"
import navbar, { renderNavbar, bindNavbarEvents} from "./src/components/navbar/navbar.js"
import footer from "./src/components/footer/footer.js"


function router() {
  const hash = (window.location.hash.slice(1) || "/").split("?")[0]

  let content = ""
  let init = null

  switch (hash) {
    case "/":
      content = home
      init = initHome
      break
    
    case "/list":
      content =list
      init = initList
      break

    case "/details":
      content = detailsPage
      init = initDetail
      break

    case "/analystdetails":
      content = analystDetailsPage
      init = initAnalyst
      break

    case "/about":
      content = about
      break

    case "/register":
      content = register
      init = initRegister
      break

    case "/analystregister":
      content = analystRegister
      init = initAnalystRegister
      break

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
      content = notfound
  }

  document.getElementById("root").innerHTML = content

  renderNavbar()
  bindNavbarEvents()

  if (init) {
    init()
  }
}

document.getElementById("foot").innerHTML = footer()

window.addEventListener("hashchange", router)
// all dependencies loaded and ready to use,browser triggers the first display
window.addEventListener("load", router)


