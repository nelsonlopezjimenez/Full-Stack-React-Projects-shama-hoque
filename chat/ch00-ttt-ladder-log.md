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

## Stage 02 — board (`teach/ch00-ttt-02-board`)

- **Changed:** `App.jsx`: `Square` renamed to `Board`, a Fragment with three `board-row` divs of
  numbered buttons. Lesson 02.
- **Why:** one element per component, Fragments, and CSS classes, before props come in.
- **Verified:** same syntax tree as the tutorial's code at the end of the section (comments ignored);
  build ok; 3 `.board-row`, squares 1–9; no console warnings.
- **Note:** the tutorial reaches this code in three small steps (two squares → Fragment → rows, then the
  rename). The stage holds only the result; the lesson's "Try it" walks the student through the steps.

## Stage 03 — props (`teach/ch00-ttt-03-props`)

- **Changed:** `App.jsx`: new `Square({ value })`, `Board` renders `<Square value="1" />` … `"9"`.
  Comments on `Board` updated for the new JSX. Lesson 03.
- **Why:** reuse a component and pass data from parent to child.
- **Verified:** same syntax tree as the tutorial; build ok; squares 1–9 in 3 rows; no console warnings.
- **Note:** the tutorial's detour (every square shows "1" before props) is a "Try it" step, not a stage.
