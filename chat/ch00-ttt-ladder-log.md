# Chapter 00 Tic-Tac-Toe teaching ladder — log

Plan: [ch00-ttt-ladder-checklist.md](ch00-ttt-ladder-checklist.md) (on `main`)
Source: https://react.dev/learn/tutorial-tic-tac-toe. The tutorial's markdown source,
`src/content/learn/tutorial-tic-tac-toe.md` in github.com/reactjs/react.dev (as of 2026-10-08), was
the reference: each stage's `App.jsx` was compared with the full `App.js` sandbox at the end of its section.

How each stage was checked: `node tools/ttt-e2e/check-stage.mjs <project> NN` (on `main`) runs
`vite build` into a scratch folder, starts the stage's own `vite.config.js` on port **5220**, and lets headless
Edge (Playwright) click through the game. It fails on a page error or any console warning the
stage does not expect.

---

## Stage 01 — setup (`teach/ch00-ttt-01-setup`)

- **Changed:** `Chapter00/tic-tac-toe/` with `package.json`, `package-lock.json`, `.gitignore`,
  `index.html`, `vite.config.js`, `src/main.jsx` (the tutorial's `index.js`), `src/App.jsx` (starter
  `Square`), `src/styles.css` (the tutorial's, plus one comment at the top), `README.md`, `lessons/01-setup.md`.
- **Why:** the tutorial's starter sandbox, on the student's own computer.
- **Verified:** build ok; one `button.square` with "X"; no console warnings.
- **Lock files:** built from the Ch03 client's final lock with `npm install --package-lock-only`, so the
  versions are the same (React 19.3.0, Vite 8.3.1). Stages 01–14: 44 packages. Stage 15: 123.
- **Notes:** the code follows the tutorial's style (semicolons), so `vite.config.js` has semicolons too,
  unlike the Ch03 client. `main.jsx` imports `./App.jsx` with its extension (the tutorial writes `./App`;
  both work in Vite).
