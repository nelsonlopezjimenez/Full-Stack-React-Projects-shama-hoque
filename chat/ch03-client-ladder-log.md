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

## Stage 02 — ttt-lift-state (`teach/ch03-client-02-ttt-lift-state`)

- **Added:** 2026-10-15, at the user's request, after the client ladder was finished: React's Tic-Tac-Toe
  tutorial as client stages 02–05, so that components, props, state and events come before the first `fetch`.
- **Changed:** five commits (02a–02e), one per react.dev section from "Setup for the tutorial" to "Lifting
  state up". `src/tic-tac-toe/TicTacToe.jsx` is the Tic-Tac-Toe ladder's `App.jsx` of stages 01–05
  (`teach/ch00-ttt-*`), with the comments adjusted (App.jsx imports it as `TicTacToe`; references to
  ladder stages point to client stages). `src/tic-tac-toe/styles.css` is the tutorial's CSS, imported by
  `TicTacToe.jsx` instead of `main.jsx`, so the game lives in one folder. `App.jsx` shows `<TicTacToe />`
  instead of the "Hello from React." paragraph; README layout; lesson 02.
- **Why this shape:** the game keeps the tutorial's code style (semicolons, `function` declarations) so it can
  be compared with react.dev line by line; the lesson says the rest of the client leaves semicolons out.
  No new packages: the stage-01 lock file is enough.
- **Verified:** build ok; every commit 02a–02e passes the Tic-Tac-Toe ladder's browser check for its tutorial section
  (`tools/ttt-e2e/check-stage.mjs`, run against the client folder), and the stage passes `ladder-e2e` s02
  (the game below the "MERN Skeleton" heading); no console warnings.

## Stage 03 — ttt-winner (`teach/ch03-client-03-ttt-winner`)

- **Changed:** three commits (03a–03c): "Why immutability is important" (comments only), "Taking turns",
  "Declaring a winner" (Tic-Tac-Toe ladder stages 06–08), lesson 03.
- **Verified:** build ok; 03a–03c pass their Tic-Tac-Toe checks (turns, filled squares, winner, no moves after a win).

## Stage 04 — ttt-keys (`teach/ch03-client-04-ttt-keys`)

- **Changed:** three commits (04a–04c): history and `Game` ("Storing a history", "Lifting state up, again"),
  "Showing the past moves", "Picking a key" (Tic-Tac-Toe ladder stages 09–11), lesson 04.
- **Note:** commit 04b has React's "unique key" warning on purpose (as the tutorial does); the stage itself
  (04c) has none.
- **Verified:** build ok; 04a–04c pass their Tic-Tac-Toe checks; 04b prints the expected key warning, 04c prints none.

## Stage 05 — ttt-time-travel (`teach/ch03-client-05-ttt-time-travel`)

- **Changed:** two commits (05a–05b): "Implementing time travel" and "Final cleanup" (Tic-Tac-Toe ladder
  stages 12–13), lesson 05 with the tutorial's "Wrapping up" exercises and a table "what you take into stage 06".
- **Stage 06 starts with a clean-up commit (06a):** it deletes `src/tic-tac-toe/` and puts `App.jsx` and the
  README back to stage 01. The users-list commit after it is the same change as before the insertion.
- **Verified:** build ok; 05a–05b pass the time-travel check (jump back, play on, the future is dropped, a winner at the end).

## Stage 06 — users-list (`teach/ch03-client-06-users-list`)

- **Changed:** `src/Users.jsx` (useState, useEffect, fetch, AbortController cleanup, list with `key`),
  `App.jsx` uses it, `vite.config.js` proxies `/api` to port 3000, lesson 02.
- **Why:** state and effects are the two ideas every later page uses. The list is a GET without
  sign-in, so nothing else is needed yet.
- **Verified:** a user created through the API appears in the list; with `/api/users` blocked in
  the browser the page shows "Cannot reach the server"; no React warnings.
- **Note:** no loading state on purpose. The final `Users.jsx` has none, and adding one only to remove
  it later would make a lesson diff go backwards.

## Stage 07 — signup-form (`teach/ch03-client-07-signup-form`)

- **Changed:** `src/Signup.jsx` (controlled inputs, `handleChange(name)`, `onSubmit` + `preventDefault`,
  POST with JSON, `response.ok`), `App.jsx` lifts a `version` counter that is the `key` of `<Users>`, lesson 03.
- **Why:** the first write request from the browser, and props in both directions.
- **Verified:** empty form → "Name is required. Email is required. Password is required."; a valid form
  → "Successfully signed up!", the fields are cleared and the name appears in the list; the same email
  again → "Email already exists".
- **Surprises:** the order of the messages depends on the body. `{}` gives "Password … Email … Name",
  while empty strings (what the form sends) give "Name … Email … Password". The lesson quotes the form's order.

## Stage 08 — request-helper (`teach/ch03-client-08-request-helper`)

- **Changed:** `src/core/request.js` (never throws, `{ error, status }`), `src/user/api-user.js`
  (`create`, `list`), `Users.jsx` and `Signup.jsx` moved into `src/user/` (git sees renames) and call
  the API functions, `vite.config.js` uses `loadEnv` + `API_PROXY_TARGET`, `.env.example`, lesson 04.
- **Why:** the same reason as server stage 07: ten more requests are coming.
- **Verified:** the stage-03 scenario still passes; a failed POST now shows "Cannot reach the server"
  under the form.
- **Changes to the plan:** (1) the folders `core/` and `user/` come here, not in stage 10, because the
  new files need a home and server stage 07 also split by folder. (2) `VITE_API_URL` and
  `credentials: 'include'` move to stage 19. Both are only needed when the client is deployed on another
  origin, and here they would have no visible effect.
- **Surprises:** when Express is down, Vite 8's proxy answers **502 with an empty body**, not a network
  error. So the page shows "Request failed (502)". "Cannot reach the server" only appears when Vite
  itself is gone (or the request is blocked). Lesson 04 shows both.
