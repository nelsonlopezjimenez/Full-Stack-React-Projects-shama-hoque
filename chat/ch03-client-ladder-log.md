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
