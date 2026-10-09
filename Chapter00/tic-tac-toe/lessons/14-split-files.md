# Stage 14 — One component per file

**Branch:** `teach/ch00-ttt-14-split-files` (starts from `teach/ch00-ttt-13-final-cleanup`)
**react.dev:** after the tutorial. Background: [Importing and Exporting Components](https://react.dev/learn/importing-and-exporting-components)

## Goal

The game is the same, but `App.jsx` is split into four files, one job each:

```
src/
  main.jsx            starts React, draws <Game />
  Game.jsx            history, currentMove, the move list
  Board.jsx           the 3 × 3 board and the status line
  Square.jsx          one button
  calculateWinner.js  plain JavaScript, no React
```

Real projects are organised like this. It also lets stage 15 test `calculateWinner` and the
components one at a time.

## New ideas

- **Modules.** Every file is a module: it sees only what it imports, and offers only what it exports.
- **Default export:** `export default function Board(…)`, imported without braces:
  `import Board from './Board.jsx'`. One per file; the importer picks the name.
- **Named export:** `export function calculateWinner(…)`, imported with braces and the same name:
  `import { calculateWinner } from './calculateWinner.js'`. A file can have many.
- **`.jsx` vs `.js`:** files with JSX are `.jsx`; `calculateWinner.js` has none.
- **A refactor** changes how the code is organised, not what it does. The browser check of stage 13
  passes unchanged.

## What changed

| File | What |
|---|---|
| `src/App.jsx` → `src/Game.jsx` | renamed; keeps only `Game`, imports `Board` |
| `src/Board.jsx` | new: `Board`, imports `Square` and `calculateWinner` |
| `src/Square.jsx` | new: `Square` |
| `src/calculateWinner.js` | new: `calculateWinner`, a named export |
| `src/main.jsx` | imports `Game` from `./Game.jsx` |
| `README.md` | mentions the new files |

## Try it

1. `git diff --stat teach/ch00-ttt-13-final-cleanup teach/ch00-ttt-14-split-files` lists the files.
   Git shows `App.jsx` as deleted and `Game.jsx` as new: git does not store renames, it guesses them,
   and by default only when at least half of the file stayed the same. Only about 40 % of `App.jsx`
   is in `Game.jsx`. Add `-M40%` to the command and git shows `{App.jsx => Game.jsx}`.
2. Remove the `import Square …` line from `Board.jsx`. Read the error in the browser
   (*"Square is not defined"*). Put it back.
3. In `Board.jsx`, write `import calculateWinner from './calculateWinner.js'` (no braces). What does the
   error say? Why?

## Exercise

Move the move list out of `Game` into a new component `MoveList.jsx` with the props `history` and
`onJump`. `Game` then renders `<MoveList history={history} onJump={jumpTo} />`. Which file has to
import which?
