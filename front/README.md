# Front-end Architecture — Router, Config, Middlewares, Utils & Components

This document explains how the `router.js`, `src/config`, `src/middlewares`, `src/utils` and `src/components` folders are organized.

The front-end is written in vanilla JavaScript (no framework, no bundler) — hash-based SPA routing, template-literal HTML instead of JSX/templates, and small reusable functions instead of framework components. As with the back-end, most files here have an existing equivalent in the React/Vue ecosystem.

Five areas, five responsibilities:

**router.js** — resolves the current route, loads the matching page, guards protected routes.

**config/** — environment/API configuration and the shared HTTP client.

**middlewares/** — client-side authentication reading (never authoritative — the back-end always re-verifies).

**utils/** — pure logic (formatting, pagination state, chart/image resolution) and DOM orchestration (lazy loading, layout).

**components/** — small functions returning HTML strings (or DOM nodes), the closest thing this project has to framework components.

# 1 — router.js

## router.js
Hash-based SPA router — resolves the current route from `window.location.hash`, dynamically imports the matching page module, guards 3 routes (`/user`, `/admin`, `/analyst`) via `roleGuard`, renders through `renderApp`, then runs the page's own `init()` function before revealing the page.

Equivalent: React Router / Vue Router — dynamic `import()` mirrors `React.lazy()`, and the `roleGuard` checks mirror route guards (Vue Router) or loaders (React Router).

# 2 — config (src/config)

## api.js
A single hardcoded constant, `API_BASE_URL`.

Equivalent: environment variables (`.env` + `import.meta.env` in Vite, or `process.env` with a bundler) — hardcoded here since the project has no build step.

## instanceHttp.js
The single HTTP client used everywhere in the front-end — a class singleton wrapping `fetch` for all 5 verbs, attaching the JWT automatically, and centralizing the reaction to an expired/invalid token (401): clears the token and redirects to `/login`, for every failed call in the whole app, with no per-page handling needed.

Equivalent: Axios — specifically its response interceptors (`axios.interceptors.response.use(...)`), which do exactly what `handleResponse` does here.

# 3 — middlewares (src/middlewares)

## roleGuard.js
Client-side authentication reading — decodes a JWT (`decodeToken`, base64url-safe), extracts its role (`getRoleFromToken`), guards a route by role (`roleGuard`), and reads the authenticated user while checking token expiry (`getAuthenticatedUser`). Never verifies the token's signature — that's structurally impossible without `JWT_SECRET`, and is not this file's job; the back-end remains the sole authority. Used for UI convenience (show/hide links, block navigation early) only.

Equivalent: the `jwt-decode` npm package (for decoding), combined with Vue Router's navigation guards or React Router's loaders (for the route-guarding part).

# 4 — utils (src/utils)

## format.js
Formatting and escaping utilities: `escapeHtml` (the project's anti-XSS defense for any dynamic text injected via `innerHTML`), `formatForexName`, `formatMarketCap` (via native `Intl.NumberFormat`), `formatTicker`/`formatChartId` (safe DOM id generation), `formatDate`.

Equivalent: `escapeHtml` ≈ a simplified `DOMPurify`, or the auto-escaping React/Vue apply by default in JSX/templates; `formatMarketCap` is already the native `Intl.NumberFormat` approach; `formatDate` ≈ `date-fns`/`dayjs`.

## assetsUtils.js
The client-side repository layer for the project's own API — one function per `/assets/*` route, at 3 levels of detail (full/light/brief), mirroring `stockService.js` on the back-end.

Equivalent: the data-fetching layer a `React Query`/`RTK Query` client would generate, here written by hand per endpoint.

## imageHelper.js
Resolves a ticker to an image path — exact-match dictionaries for the 5 commodities and 3 forex pairs currently in the project, then a generic fallback guessing a path from the ticker's shape (never verified against disk).

Equivalent: no direct framework equivalent — closest to a static asset manifest/resolution table.

## chartManager.js
A `Map`-based registry of live ApexCharts instances, keyed by ticker — `registerChart`/`destroyChart` prevent orphaned chart instances from accumulating across re-renders.

Equivalent: the lifecycle management `react-apexcharts`/`vue3-apexcharts` provide automatically via component unmount hooks (`useEffect` cleanup, `beforeUnmount`) — reconstructed here by hand.

## tradingChart.js
Builds and renders the two chart styles used in the app — a full candlestick chart (`loadTradingViewChart`, detail pages) and a mini sparkline (`loadMiniChart`, cards) — both via ApexCharts, both registered with `chartManager.js`.

Equivalent: the official `react-apexcharts`/`vue3-apexcharts` bindings.

## lazyloading.js
Powers every carousel in the app — lazy-loads mini charts via `IntersectionObserver` (only once a card is actually visible), and implements infinite scroll by recycling DOM cards (moving the first/last card to the other end) rather than rendering an unbounded list.

Equivalent: `react-intersection-observer` for the lazy-load half; `Swiper.js`/`Embla Carousel` for the infinite-scroll half.

## pagination.js
A pagination state machine built with closures (`createPaginator`) — tracks offset/limit/hasNext privately, exposes `load`/`next`/`prev`/`reset`/`bind`. Framework-agnostic: knows nothing about the DOM beyond the buttons it's bound to.

Equivalent: `useInfiniteQuery`/`usePagination` from TanStack/React Query.

## actionManager.js
Event delegation for recommendation actions (delete via click, edit via form submission) — listens on a shared container rather than on individual buttons, so it keeps working even as the list re-renders.

Equivalent: the delegated-event pattern popularized by jQuery (`.on()`), abstracted away natively by React/Vue's declarative event handlers.

## assetFormatter.js
Merges a minimal watchlist entry with the matching full asset record (found by ticker) — pure data merging, no network access of its own.

Equivalent: Redux selectors (`reselect`), or a `lodash.merge`-style utility.

## recommendationUtils.js
Maps a recommendation status (`BUY`/`SELL`/anything else) to an icon path. The smallest file in the project.

Equivalent: a simple lookup/mapping utility, comparable to an icon-mapping helper in a UI library.

## layoutManager.js
Decides the page's visual shell — navbar/footer for a normal page, or the admin sidebar layout — and owns the anti-flash mechanism (`opacity: 0` at the start of a render, revealed again once the page's `init()` completes). Also triggers the one-time global logout binding (`bindLogoutEvent()`) as a side effect of being imported.

Equivalent: nested layouts — React Router's `<Outlet>`, Vue Router's named layouts, or the `Layout` concept in Next.js/Nuxt.

## logoutUtils.js
A single delegated click listener on `document`, watching for `#logout-btn` — clears the token and forces a full page reload (not just a hash change), which incidentally also clears any accumulated carousel timers/listeners from the session.

Equivalent: a global logout action dispatched from a store (Redux/Pinia/Vuex).

# 5 — components (src/components)

## Cards — `components/cards/`

### stockCards.js / forexCards.js / commodityCards.js / analystCard.js
Template functions returning the HTML for one card each — the most-consumed building block in the app, fed into both the carousel and pagination components via a `cardComponent`/`itemTemplate` parameter.

Equivalent: React/Vue functional components — the same idea (props in, markup out), written with template literals instead of JSX/SFC templates.

## Carousel — `components/carousel/`

### carouselComponent.js
Wraps `lazyloading.js` — creates the carousel's DOM container, delegates rendering/scrolling/lazy-loading to `enableCarouselWindow`, then owns click handling: either a custom action (`onActionClick`) or navigation (`buildUrl`).

Equivalent: a `<Carousel>` component taking render props/slots (`cardComponent`, `buildUrl`, `onActionClick` play the same role as React render props or Vue scoped slots).

## Pagination — `components/pagination/`

### paginationComponent.js
Wraps `pagination.js` — creates the list container and prev/next buttons, delegates state to `createPaginator`, and owns click handling: navigation via `data-js-clickable` + `buildUrl`, while explicitly stepping aside for delete/edit clicks so `actionManager.js` can handle those instead.

Equivalent: a `<PaginatedList>` component, comparable to what `useInfiniteQuery` + a render prop would produce in React.

## Forms — `components/forms/`

### recoForm.js / analystUpdateForm.js / userUpdateForm.js
Static HTML form templates — no interpolated dynamic data, submission handled by each page's own JS (`preventDefault` + `FormData` + `instanceHttp`).

Equivalent: uncontrolled form components — native HTML forms read via `FormData`, as opposed to React's typical controlled-input pattern.

## Navigation — `components/navLinks/`, `components/navbar/`, `components/footer/`, `components/sidebar/`

### navLink.js
The smallest component in the project — one function, turns 3 parameters into an `<a>` tag.

Equivalent: a `<NavLink>` component.

### navbar.js
The main navigation — logo, sign-in/register for a visitor, role-specific link and logout button for an authenticated user. Regenerated on every page render, checked against the authenticated-user state (with expiry) each time.

Equivalent: a `<Navbar>` component.

### footer.js
Logo, social placeholders, about link, conditional call-to-action.

Equivalent: a `<Footer>` component.

### adminSidebar.js
The minimal admin-only navigation, swapped in for the navbar/footer entirely on admin pages.

Equivalent: an `<AdminLayout>`'s nested navigation.

## Search — `components/searchBar/`

### searchBarUtils.js
A generic, reusable search bar (`createSearchBar`, `renderResults`, `initGenericSearchBar`) — filters an in-memory dataset by ticker/name, no network call, capped at 5 results. The only file in the project built with imperative `document.createElement`/`appendChild` rather than `innerHTML` templates.

Equivalent: a typeahead/autosuggest component, comparable to `downshift` or `react-autosuggest`.

# 6 — Why not use these libraries directly?

Same answer as the back-end document: the DWWM reference requires demonstrating command of JavaScript itself, not of a framework. Writing `chartManager.js` by hand instead of relying on `react-apexcharts`'s automatic cleanup, or `pagination.js`'s closures instead of `useInfiniteQuery`, shows the underlying mechanism is understood — closures, `IntersectionObserver`, event delegation, the DOM APIs a framework would otherwise hide. This choice is consistent across the whole project, not incidental to any one file.

# Front-end Flows — How Every Piece Connects

This document maps the actual call chains between router, config, middleware, utils, and components — complementing `front-end-architecture.en.md` (which describes each file in isolation) with how they connect in practice. Each flow was traced against the real code, not assumed.

# 1 — Page lifecycle (the macro flow)

Every page render, from any trigger, goes through the same 5 stages:

```
hashchange / load
  triggered by: a plain <a href="#..."> link, a click on a card (via buildUrl),
  a successful login/register, a logout, or roleGuard redirecting a denied access
    ↓
router.js
  resolves the route from the hash, checks role via roleGuard.js on 3 of the
  10 routes (/user, /admin, /analyst), dynamically imports the matching page
    ↓
layoutManager.js (renderApp)
  injects navbar.js/footer.js OR adminSidebar.js depending on layoutType,
  starts the anti-flash mechanism (opacity: 0)
    ↓
the page's own init() function
  fetches data (assetsUtils.js → instanceHttp.js), then hands off rendering
  to either a carousel or a pagination component (see sections 3 and 4)
    ↓
opacity: 1
  revealed once init() completes (success or caught failure) — closes the
  fade started by layoutManager.js
```

Not every route has an `init()` — `/about` and the 404 page are pure static content and skip this step.

# 2 — Data fetching and the 401 safety net

```
any page's init()
    ↓
assetsUtils.js (getStock, getForex, getStockLight, getBriefAssets, ...)
    ↓
instanceHttp.js (http.get/post/put/patch/delete)
  attaches Authorization: Bearer <token> to every request, regardless of
  whether the route needs it
    ↓
fetch() → back-end API
    ↓
instanceHttp.js (handleResponse)
  on any non-2xx response — throws { response: { data }, status }
  on 401 specifically — ALSO clears the token and redirects to /login,
  for literally every failed call in the whole app, with no per-page handling
```

This is the single place in the front-end that reacts to an expired/invalid token — it closes the loop with `authMiddleware.js` on the back-end, which is what actually detects the expiry.

# 3 — Carousel: creation, rendering, and the click handler

Used at 9 call sites across 4 pages (`home.js` ×4, `analyst.js` ×2, `user.js` ×2, `assetsdetails.js` ×1 direct).

```
a page (home.js, analyst.js, user.js)
    ↓
carouselComponent.js (createCarousel)
  creates the .carousel container itself (unlike lazyloading.js, which only
  looks for an existing one)
    ↓
lazyloading.js (enableCarouselWindow)
  samples up to 30 random cards if the list has more than 2 items, renders
  each via the cardComponent passed in, lazy-loads mini charts through
  IntersectionObserver, recycles cards for infinite scroll
    ↓
stockCard / forexCard / commodityCard / analystCard
  (see section 5 for what each card itself pulls in)
```

Back in `carouselComponent.js`, a single delegated click listener handles navigation:

```
click anywhere on a card → buildUrl(dataset)
    → #/details?type=X&ticker=Y  → assetsdetails.js   (stock/forex/commodity cards)
    → #/analystdetails?id=Y      → analystsdetails.js (analyst cards)
```

This used to fork into a second branch (`onActionClick`, meant to trigger follow/unfollow directly from a card) — that code has since been removed as dead: it was leftover from an abandoned attempt to integrate follow/unfollow on carousel cards, dropped due to side effects (likely keeping "followed" state in sync across recycled cards). The real, fully working follow/unfollow lives on `assetsdetails.js` instead, as a direct (non-delegated) listener on a single toggle button — see section 6b.


# 4 — Pagination: creation, rendering, and the click fork

Used at 12 call sites across 7 pages, for lists rather than carousels (asset list, recommendations, watchlist, followed analysts).

```
a page (admin.js, analyst.js, user.js, assetsdetails.js, analystsdetails.js, list.js)
    ↓
paginationComponent.js (createPaginationList)
  creates the list container and prev/next buttons
    ↓
pagination.js (createPaginator)
  a closure-based state machine (offset/limit/hasNext), knows nothing
  about the DOM beyond the buttons it's bound to
    ↓
itemTemplate(item) — a card, or a plain item row, depending on the page
```

Unlike the carousel, pagination's click handling coexists with a **second, independent listener** on the same container:

```
click on the list container
    ├── on the prev/next buttons → paginator.prev() / paginator.next()
    │
    ├── on .delete-btn or inside .edit-form → paginationComponent.js
    │     explicitly steps aside (returns early) so actionManager.js's
    │     own listener — attached separately to the same container —
    │     can handle it (see section 6)
    │
    └── anywhere else on an item marked [data-js-clickable] → buildUrl(dataset)
          → confirmed present in all 9 item templates that use this
          component; unlike the carousel's action branch, this works
```

# 5 — Card rendering: image and chart resolution

Every card (`stockCard`, `forexCard`, `commodityCard`, `analystCard`) pulls in the same two utilities:

```
stockCard / forexCard / commodityCard
    ├── imageHelper.js (formatAssetImage)
    │     exact-match dictionaries first, then a shape-based guess —
    │     always wins over the real API-provided image/logo URL, which
    │     is fetched, carried through the whole pipeline, and never used
    │
    └── format.js (escapeHtml, formatChartId)
          escapeHtml applied uniformly to every interpolated field,
          including numeric ones — a deliberate choice, not caution
          left over from uncertainty

analystCard
    └── the real API-provided picture, served directly from /uploads/
        (public, unauthenticated — appropriate here since a profile
        picture is meant to be public; the analyst's verification
        document, served from the same route, is not)
```

Only `stockCard` currently has a chart:

```
stockCard's <div class="chart" id="${formatChartId(ticker)}">
    ↓ (once visible in the viewport)
lazyloading.js's IntersectionObserver
    ↓
tradingChart.js (loadMiniChart)
  looks up the container via the SAME formatChartId(ticker) — consistent
  end to end since this session's fixes
    ↓
chartManager.js
  destroyChart(ticker) before creating a new instance, registerChart(ticker, chart)
  after — prevents orphaned ApexCharts instances from accumulating
```

Forex and commodity cards have no chart container at all — not a bug, a feature not yet built. If one were added, it would need to source its history data first (`aggregateForexJson`/`aggregateMetalsJson` on the back-end currently never return a `history` field).

# 6 — Recommendation lifecycle: create, read, update, delete

```
CREATE
recoForm.js (static form, status + comment, no dynamic data to escape)
    ↓ submit, intercepted by assetsdetails.js's own handler
instanceHttp.js → POST /recommendations
    ↓ on success
setTimeout(() => initDetail(), 1000) — re-runs the whole page's init(),
  including a full re-fetch of stocks/forex/commodities, not just the
  recommendation list that actually changed

READ
paginationComponent.js + pagination.js, as in section 4
  itemTemplate renders each recommendation as a [data-js-clickable] row,
  with a nested .delete-btn and .edit-form

UPDATE / DELETE
actionManager.js — a second listener, attached to the same list container
    ├── click on .delete-btn → instanceHttp.js → DELETE /recommendations/:id
    └── submit on .edit-form → instanceHttp.js → PUT /recommendations/:id
  both paths finish the same way: paginatorInstance.load() refreshes just
  the list, rather than reloading the whole page — a lighter, more
  targeted refresh than the CREATE path above
```

# 6b — Follow/unfollow toggle

The real, working follow/unfollow feature — a single toggle button on the asset detail page, not on carousel cards (see the note in section 3):

```
assetsdetails.js
    #follow-toggle-btn — a direct (non-delegated) click listener, appropriate
    here since this button lives on a page rendered once per navigation,
    never recycled the way carousel cards are
        ↓ reads its own data-followed state
        ├── already followed → instanceHttp.js → DELETE /users/me/follows/:ticker
        └── not followed yet → instanceHttp.js → POST /users/me/follows
    button disabled for the duration of the request (prevents double-clicks),
    then its label/state flips to match the new status
```

# 7 — Authentication: login, register, logout

```
login.js / register.js / analystRegister.js
  read form fields via new FormData(form) — used only as a convenient
  reader, then repackaged into a plain object for login.js/register.js
  (no file involved), or sent as-is for analystRegister.js (real file
  uploads: picture + document, matching Multer on that specific route)
    ↓ on success
window.location.hash = "/admin" | "/analyst" | "/user" | "/"
  (role read from the JWT returned by the back-end)
    ↓
router.js picks it up via hashchange, as in section 1

LOGOUT
logoutUtils.js — one delegated click listener on document (not a
  container), watching for #logout-btn, bound once at module load time
  via layoutManager.js's import (an easy-to-miss side effect)
    ↓
localStorage.removeItem("token")
window.location.reload() — a full reload, not just a hash change; this
  incidentally also clears any accumulated carousel timers/listeners
  from the session, a side benefit of going further than strictly needed
```

# 8 — Profile update forms

```
analystUpdateForm.js — shared between analyst.js (self-update) and admin.js
  (editing another analyst), disambiguated by a hidden target_user_id field
    ├── from analyst.js: submitted raw to PUT /users/me — target_user_id
    │     stays empty and is simply never read by that route (the
    │     back-end derives the user from the JWT instead)
    └── from admin.js: target_user_id read and used to build
          PUT /users/:id — safe only because this whole page requires
          an admin role, checked independently on both the front-end
          route guard and the back-end middleware

userUpdateForm.js — the simpler version for a regular user, always
  submitted to PUT /users/me, no target_user_id at all
```

# 9 — Search bar

```
home.js
    ↓ passes the already-fetched allData (stocks + forex + commodities)
searchBarUtils.js (initGenericSearchBar)
    ↓ on every keystroke, no debounce (fine at this data scale)
    filters allData in memory by ticker/name, capped at 5 results
    ↓
renderResults
    ↓ on click on a result
onSelect(item) → window.location.hash = `#/details?type=${item.type}&ticker=${item.ticker}`
  → router.js, as in section 1
```

# 10 — What ties every flow back together

Two mechanisms recur across every single flow above, and are worth naming explicitly:

- **Delegated click listeners on a shared container**, never on individual elements — used by `logoutUtils.js` (on `document`), `actionManager.js`, `carouselComponent.js`, and `paginationComponent.js` (both on their own container). This is what lets the app keep working correctly across constant DOM replacement, without ever needing to re-attach a listener after a re-render.
- **A `buildUrl`/`itemTemplate`/`cardComponent` parameter passed by the caller**, never hardcoded inside the reusable component — the same dependency-injection pattern repeated in `carouselComponent.js`, `paginationComponent.js`, and `searchBarUtils.js`. It's what lets 3 generic files serve more than 20 different call sites without ever needing to know, themselves, what they're displaying or where a click should lead.
