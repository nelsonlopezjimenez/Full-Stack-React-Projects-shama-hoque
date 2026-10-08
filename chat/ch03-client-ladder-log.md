# Chapter 03 teaching ladder (client) — log

Plan: [ch03-client-ladder-checklist.md](ch03-client-ladder-checklist.md)

How each stage was checked: the server of stage 19 ran from a scratch copy on port **3210** with its own
database **`mernskeleton_ladder`** (the real `mernskeleton` data and the server on 3100 were not touched).
For each client stage a script ran `vite build` (into a scratch folder, not `client/dist`) and started
the stage's own `vite.config.js` on port **5210** with `/api` forwarded to 3210. Then headless Edge
(Playwright) opened the pages, filled the forms, and failed on any page error or React warning in the console.
`node_modules` came from the final client, so every stage ran with the final package versions.

---

## Stage 01 — hello (`teach/ch03-client-01-hello`)

- **Changed:** `client/` with `package.json` (react, react-dom, vite, @vitejs/plugin-react; scripts
  `dev` / `build`), `.gitignore` (the migration's), `index.html`, `vite.config.js`, `src/main.jsx`,
  `src/App.jsx`, `README.md`, `lessons/01-hello.md`. The ladder README lists both series.
- **Why:** the smallest React app, so that later files each have a reason to appear.
- **Verified:** build ok; the page shows "MERN Skeleton" and "Hello from React."; no console errors
  (the only 404 is the browser asking for `/favicon.ico`).
- **Lock files:** as in the server series, each stage's `package-lock.json` is the final client lock
  pruned with `npm install --package-lock-only`. Stage 01 lock has 44 packages.

## Stage 02 — users-list (`teach/ch03-client-02-users-list`)

- **Changed:** `src/Users.jsx` (useState, useEffect, fetch, AbortController cleanup, list with `key`),
  `App.jsx` uses it, `vite.config.js` proxies `/api` to port 3000, lesson 02.
- **Why:** state and effects are the two ideas every later page uses. The list is a GET without
  sign-in, so nothing else is needed yet.
- **Verified:** a user created through the API appears in the list; with `/api/users` blocked in
  the browser the page shows "Cannot reach the server"; no React warnings.
- **Note:** no loading state on purpose. The final `Users.jsx` has none, and adding one only to remove
  it later would make a lesson diff go backwards.

## Stage 03 — signup-form (`teach/ch03-client-03-signup-form`)

- **Changed:** `src/Signup.jsx` (controlled inputs, `handleChange(name)`, `onSubmit` + `preventDefault`,
  POST with JSON, `response.ok`), `App.jsx` lifts a `version` counter that is the `key` of `<Users>`, lesson 03.
- **Why:** the first write request from the browser, and props in both directions.
- **Verified:** empty form → "Name is required. Email is required. Password is required."; a valid form
  → "Successfully signed up!", the fields are cleared and the name appears in the list; the same email
  again → "Email already exists".
- **Surprises:** the order of the messages depends on the body. `{}` gives "Password … Email … Name",
  while empty strings (what the form sends) give "Name … Email … Password". The lesson quotes the form's order.
