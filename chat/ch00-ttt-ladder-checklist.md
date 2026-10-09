# Chapter 00 — teaching ladder, Tic-Tac-Toe (react.dev tutorial)

**Status:** approved and built 2026-10-08: `teach/ch00-ttt-01-setup` … `teach/ch00-ttt-15-tests` (your answers are under "Answers" at the end). Changes to the plan are recorded in the log.
**Log:** `ch00-ttt-ladder-log.md`, on the ladder branches (like the Ch03 ladders)
**Source:** https://react.dev/learn/tutorial-tic-tac-toe (the official React tutorial)
**Target:** the tutorial's final `App.js` (Square, Board, Game, `calculateWinner`, `history`,
`currentMove`, derived `xIsNext`), running in a Vite project instead of CodeSandbox.

## Goal

A short, **React-only** ladder that comes *before* the MERN chapters: no server, no database, no router,
no MUI. Each tutorial section becomes one stage branch, so

```bash
git diff teach/ch00-ttt-06-taking-turns teach/ch00-ttt-07-winner -- Chapter00/tic-tac-toe
```

shows exactly what that tutorial section asks the student to type. Students can read the react.dev
page and the diff side by side.

## Decisions

All approved on 2026-10-08, except T10 (no comment-free series).

| # | Decision | Choice |
|---|---|---|
| T1 | Folder | **`Chapter00/tic-tac-toe/`.** Chapter00 already holds the before-the-book material (git diff, routes). |
| T2 | Branch prefix | **`teach/ch00-ttt-NN-name`.** Same namespace as the Ch03 ladders, so `git branch --list "teach/ch00-ttt-*"` lists the series. |
| T3 | First stage based on | **`main`.** The ladder does not depend on the Ch03 chain. Students can start it without MongoDB. |
| T4 | Tooling | **Vite + React 19, plain JavaScript**, the same versions as the Ch03 client (`react`, `react-dom`, `vite`, `@vitejs/plugin-react`). The tutorial uses CodeSandbox (`index.js`, `App.js`). We keep the file names `App.jsx` and `styles.css` and the tutorial's `styles.css` content, so the code matches the page. `main.jsx` takes the place of `index.js`. |
| T5 | Code style | **the tutorial's own code** (semicolons, `function` declarations, `'Winner: ' + winner`), so it matches react.dev letter by letter. The modern versions (template strings, `.map()` loops) are only shown in `[ADVANCED]` comments and in the exercises (T7). |
| T6 | Comments and lessons | `[BEGINNER]` / `[ADVANCED]` comments as in the Ch03 ladders. One lesson note per stage, `lessons/NN-name.md`: what's new, a link to the matching react.dev section, "try it", one exercise. Student instructions stay on `main` (`instructions/`), and the lessons link to them. |
| T7 | The tutorial's "Wrapping up" ideas | **exercises only, not stages.** The five ideas (current move as text, two loops for the board, sort toggle, highlight the win + draw message, (row, col) in the history) go into the last lesson as exercises. The answers go in a **gist**, never in the repo (same rule as the Ch03 and Ch00 answers). |
| T8 | Split into files | **yes, stage 14** (after the tutorial ends): `Square.jsx`, `Board.jsx`, `Game.jsx`, `calculateWinner.js`. This mirrors server stage 07 and client stage 04 (one job per file) and sets up the tests. |
| T9 | Tests | **yes, stage 15**: Vitest + Testing Library. `calculateWinner` (pure function) → click squares in `<Game />` (render + events) → time travel. |
| T10 | Comment-free series | **No** (your choice). |
| T11 | Credit | react.dev's content is under CC BY 4.0. The README credits it and links to the tutorial. The code is retyped from the tutorial, the comments and lessons are ours. |

## Stages

### Part A — the tutorial, one section per stage

| # | Branch | react.dev section | Content |
|---|---|---|---|
| 01 | `…-01-setup` | Setup / Inspecting the starter code | Empty folder → `package.json` (`"type": "module"`, `dev`/`build`/`preview`), `index.html` with `#root`, `vite.config.js` (port 5173), `main.jsx` (`createRoot`, `StrictMode`, imports `styles.css`), `App.jsx` = `Square` returning one `<button className="square">X</button>`. `.gitignore`, `README.md`. |
| 02 | `…-02-board` | Building the board | `Square` renamed to `Board`: 9 buttons in 3 `board-row` divs, numbers 1–9. Fragments `<>…</>`: why a component returns one element. |
| 03 | `…-03-props` | Passing data through props | A new `Square({ value })`, `Board` renders `<Square value="1" />`… Destructuring props, `{value}` in JSX. |
| 04 | `…-04-interactive-square` | Making an interactive component | `onClick`, first `console.log('clicked!')`, then `useState(null)` in `Square`, `setValue('X')`. React DevTools. Each square has its own state. |
| 05 | `…-05-lift-state` | Lifting state up | `squares` = `useState(Array(9).fill(null))` in `Board`. `Square` gets `value` + `onSquareClick`. `handleClick(i)` with `slice()`. Why `onSquareClick={() => handleClick(0)}` and not `handleClick(0)` (the too-many-renders error). |
| 06 | `…-06-immutability` | Why immutability is important | No new behavior. Comments and the lesson only: copy vs mutate, how React compares state. Kept as its own stage (your choice). |
| 07 | `…-07-taking-turns` | Taking turns | `xIsNext` state, X/O alternate, early return when the square is filled. |
| 08 | `…-08-winner` | Declaring a winner | `calculateWinner(squares)`, `status` line, no moves after a win. |
| 09 | `…-09-lift-state-again` | Storing a history / Lifting state up, again | New `Game` (default export), `history`, `handlePlay`; `Board` keeps no state of its own (gets `xIsNext`, `squares`, `onPlay` as props). Spread `[...history, nextSquares]`. |
| 10 | `…-10-past-moves` | Showing the past moves | `history.map` → move buttons, `jumpTo` still empty. The "unique key" warning in the console is left in **on purpose**. |
| 11 | `…-11-keys` | Picking a key | `<li key={move}>`. Why not the array index in general, and why it is fine here. |
| 12 | `…-12-time-travel` | Implementing time travel | `currentMove`, `jumpTo`, `history.slice(0, currentMove + 1)`, `history[currentMove]`. |
| 13 | `…-13-final-cleanup` | Final cleanup | `xIsNext` state removed, derived from `currentMove % 2 === 0`. **Equals the tutorial's final code.** Last lesson lists the "Wrapping up" exercises (T7). |

### Part B — after the tutorial (optional, see T8/T9)

| # | Branch | Content | Packages |
|---|---|---|---|
| 14 | `…-14-split-files` | One component per file + `calculateWinner.js`; `import`/`export` default vs named. Same behavior. | |
| 15 | `…-15-tests` | Vitest + Testing Library: `calculateWinner` → play a game with clicks → time travel. `test` block in `vite.config.js`. | vitest, jsdom, @testing-library/react, @testing-library/jest-dom (the Ch03 client's versions; `fireEvent` instead of user-event, as in Ch03) |

## Conventions

As in the Ch03 ladders: one branch per stage pointing at its last commit, every commit runs
(`npm install && npm run dev`), a log entry per stage, `package-lock.json` built from the final lock so
every stage uses the same versions. Checks run on Vite port 5220 (not 5173, which Ch02 uses), and I stop
only processes I started. A headless Edge check per stage, `tools/ttt-e2e/` on `main` (it reuses `tools/ladder-e2e/config.mjs`),
clicks through the game and checks that the key warning appears in 10 and is gone in 11.

## Fixing an earlier stage later

As for Ch03: commit on the stage where the fix belongs, then
`git switch teach/ch00-ttt-15-tests && git rebase --update-refs <that stage>`, then
`node tools/ttt-e2e/run.mjs` to check every stage again.

## Final check

Stage 13's `App.jsx`, with comments removed, matches the tutorial's final `App.js` (only the import of
`styles.css` moves to `main.jsx`). Every difference goes in a table in the log.

## Answers (2026-10-08)

1. Folder `Chapter00/tic-tac-toe/` and prefix `teach/ch00-ttt-NN-name`: OK.
2. Stage 06 (immutability) stays a stage of its own.
3. The "Wrapping up" ideas are exercises; the answers go in a gist.
4. Part B is built: stages 14 (split files) and 15 (tests).
5. No comment-free series.
6. `instructions/working-with-the-lesson-stages.md` gets a short section for this ladder.
