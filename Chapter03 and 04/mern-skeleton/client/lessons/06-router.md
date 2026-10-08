# Client stage 06 — Pages and URLs: React Router

**Branch:** `teach/ch03-client-06-router`

## Goal

Three pages with their own URLs, `/`, `/users` and `/signup`, plus a menu and a "Page not found".
The browser's Back button, bookmarks and reload work as on any website, but the page never reloads.

## New ideas

- **Client-side routing.** Clicking a link does not ask the server for a new HTML page. React Router changes
  the URL with the browser's History API and shows another component. Only the data (`/api/...`) still
  comes from the server.
- **`<BrowserRouter>`** (in `App.jsx`) watches the address bar; **`<Routes>` / `<Route path element>`**
  (in `MainRouter.jsx`) decide which component a URL shows; **`path="*"`** catches every other URL.
- **`<NavLink>`** is a link that knows when it is the current page (CSS class `active`). `end` makes it
  match only the exact URL.
- **`component={NavLink}`** renders an MUI `Button` *as* a link: the look of a button, the behaviour of a link.
- **Layout outside `<Routes>`.** `<Menu />` is above `<Routes>`, so it stays on every page.
- **Fragments `<>…</>`** group elements without adding an extra `<div>`.
- **No more lifted state.** The list and the form are on different pages now. `<Users>` is created every
  time you open `/users`, so it always loads a fresh list. The `version` / `key` trick of stage 03 is gone.

## What changed

| File | What |
|---|---|
| `package.json` | `react-router` |
| `src/App.jsx` | `BrowserRouter`, renders `<MainRouter />` |
| `src/MainRouter.jsx` | new: the menu and the routes |
| `src/core/Menu.jsx` | new: app bar with Home, Users, Sign up |
| `src/core/NotFound.jsx` | new: shows the unknown path and a "Go home" button |
| `src/user/Signup.jsx` | no `onCreated` prop any more |

## Try it

1. Click through the menu and watch the address bar and DevTools → **Network**: no new HTML document
   is loaded, only `/api/users` when you open the list.
2. Use the Back and Forward buttons. Reload on `/users`: the Vite dev server answers every page URL
   with `index.html`, and React Router shows the right page. (In production the Express server does the
   same with its SPA fallback, server lesson 18.)
3. Open http://localhost:5173/abc: "Page not found", with the path. Compare with
   http://localhost:5173/api/abc: that one is the *server's* JSON 404 (server stage 08).
4. Remove `end` from the Users button and open `/users`: still fine. Remove it from the Home icon: Home is
   now "active" on every page. Why?

## Exercise

Add an "About" page at `/about` (a `Card` with a sentence) and a menu button for it. Which three files
do you touch?
