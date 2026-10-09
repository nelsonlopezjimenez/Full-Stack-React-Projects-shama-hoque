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

## Stage 04 — interactive-square (`teach/ch00-ttt-04-interactive-square`)

- **Changed:** `App.jsx`: `import { useState }`, `Square()` with `useState(null)` and `handleClick` →
  `setValue('X')`, the tutorial's multi-line `<button … onClick={handleClick}>`; `Board` renders nine
  `<Square />` without props. Lesson 04 (includes the React Developer Tools section and its links).
- **Why:** events and state, the two things that make a page interactive.
- **Verified:** same syntax tree as the tutorial; build ok; empty board, clicking squares 1 and 5 shows
  X in exactly those two; no console warnings.
- **Note:** the `console.log('clicked!')` step of the tutorial is a "Try it" step, not in the code.

## Stage 05 — lift-state (`teach/ch00-ttt-05-lift-state`)

- **Changed:** `App.jsx`: `Square({ value, onSquareClick })` without state; `Board` owns
  `squares = useState(Array(9).fill(null))`, `handleClick(i)` copies with `slice()`, and every square gets
  `value={squares[i]}` and `onSquareClick={() => handleClick(i)}`. Lesson 05.
- **Why:** the tutorial's central idea: shared state lives in the parent.
- **Verified:** same syntax tree as the tutorial's sandbox at the end of the section; build ok; the
  stage-04 scenario passes unchanged (same behavior); no console warnings.
- **Note:** the tutorial passes through two intermediate versions (an empty board without clicks, then
  `handleClick()` that always fills square 0). Both are "Try it" steps in the lesson.

## Stage 06 — immutability (`teach/ch00-ttt-06-immutability`)

- **Changed:** only the comment above `handleClick` (mutate vs copy, `Object.is`, other ways to copy).
  Lesson 06 with a "break it on purpose" step.
- **Why:** you chose to keep the tutorial's "talk only" section as a stage of its own. The diff from
  stage 05 is comments only, so students see that nothing in the code changed.
- **Verified:** same syntax tree as stage 05 and the tutorial; build ok; the stage-04 scenario passes.
  The "Try it" claim was tested too: with `squares[i] = 'X'; setSquares(squares);` the browser check
  clicked two squares and the board stayed empty.

## Stage 07 — taking-turns (`teach/ch00-ttt-07-taking-turns`)

- **Changed:** `App.jsx`: `xIsNext` state, early return for filled squares, X or O, `setXIsNext(!xIsNext)`.
  Lesson 07.
- **Why:** a second state, and a guard in an event handler.
- **Verified:** same syntax tree as the tutorial; build ok; X then O; clicking a filled square changes
  nothing; the next click is X again; no console warnings.
- **Note:** the tutorial writes `function Square({value, onSquareClick})` (no spaces) in this section
  and in two later ones, and `{ value, onSquareClick }` elsewhere and in its final code. The ladder uses
  the final spelling everywhere, so diffs never show a whitespace-only change.

## Stage 08 — winner (`teach/ch00-ttt-08-winner`)

- **Changed:** `App.jsx`: `calculateWinner()` (with the trailing comma after the last line, as in the
  tutorial's final code), `winner`/`status`, `<div className="status">`, the guard also checks for a
  winner. Lesson 08.
- **Why:** a pure helper function and values derived during rendering.
- **Verified:** same syntax tree as the tutorial's sandbox; build ok; "Next player: X" → "O"; X wins the
  top row, "Winner: X", a click on square 9 is ignored; no console warnings.

## Stage 09 — lift-state-again (`teach/ch00-ttt-09-lift-state-again`)

- **Changed:** `App.jsx`: new default export `Game` with `xIsNext`, `history`, `currentSquares`,
  `handlePlay`, the `game` layout and an empty `<ol>{/*TODO*/}</ol>` (the tutorial's own placeholder);
  `Board({ xIsNext, squares, onPlay })` without state. The "lifting state up" and "two updates, one
  redraw" comments moved with the code into `Game`. Lesson 09 covers both tutorial sections.
- **Why:** the "Storing a history of moves" section has no code of its own, so it shares this stage
  (as planned).
- **Verified:** same syntax tree as the tutorial's sandbox; build ok; the board is inside
  `.game .game-board`; the stage-08 scenario (turns, win, no move after the win) passes; no console warnings.
