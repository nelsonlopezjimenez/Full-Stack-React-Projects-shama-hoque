# Client stage 03 — Tic-Tac-Toe 2: immutability, turns and a winner

**Branch:** `teach/ch03-client-03-ttt-winner` (starts from `teach/ch03-client-02-ttt-lift-state`)
**react.dev:** [Why immutability is important](https://react.dev/learn/tutorial-tic-tac-toe#why-immutability-is-important),
[Taking turns](https://react.dev/learn/tutorial-tic-tac-toe#taking-turns),
[Declaring a winner](https://react.dev/learn/tutorial-tic-tac-toe#declaring-a-winner)

## Goal

A real game for two players: X and O take turns, a filled square cannot be changed, and a line above the
board says *"Next player: X"* or *"Winner: O"*. After a win, no more moves are possible.

## Build it yourself first

Start from the end of stage 02 and copy this note into your branch:

```bash
git fetch upstream
git switch --no-track -c my/ch03-client-03-ttt-winner upstream/teach/ch03-client-02-ttt-lift-state
git restore --source=upstream/teach/ch03-client-03-ttt-winner -- ":/Chapter03 and 04/mern-skeleton/client/lessons/03-ttt-winner.md"
```

**What must be running:** only the client (`npm run dev`). No server, no database.

**Your task:** read the three tutorial sections above and change `src/tic-tac-toe/TicTacToe.jsx`:

1. **Why immutability is important:** no new code. Read it, then write a comment above `handleClick`
   in your own words: why `squares.slice()` and not `squares[i] = 'X'`?
2. **Taking turns:** a second state in `Board`, `xIsNext` (starts `true`). A click writes `'X'` or `'O'` and
   flips `xIsNext`. A click on a filled square does nothing (an early `return`).
3. **Declaring a winner:** a plain function `calculateWinner(squares)` at the end of the file (the tutorial
   gives you the eight winning lines), a `status` line above the board, and no moves after a win.

**Done when:** you can play a whole game; the status line names the winner; clicks after a win do nothing.

**Compare** (from the `client` folder):

```bash
git diff upstream/teach/ch03-client-03-ttt-winner -- src
git log --oneline upstream/teach/ch03-client-02-ttt-lift-state..upstream/teach/ch03-client-03-ttt-winner
```

## New ideas

- **Mutating vs. not mutating.** `squares[0] = 'X'` changes the array in place. `const next = squares.slice();
  next[0] = 'X'` makes a changed copy and leaves the old array as it was (**immutability**).
- **Why React cares:** it compares the old and the new state to decide whether to draw again. A changed copy
  is a new array, so React sees the change. The same array, changed inside, looks like *no change*.
- **Old versions stay intact.** That makes undo and the "time travel" of stage 05 possible.
- **Several states in one component:** `useState` can be called as often as needed.
- **Flipping a boolean:** `setXIsNext(!xIsNext)`.
- **Early return:** `if (squares[i]) { return; }`. `null` is "falsy", `'X'` and `'O'` are "truthy".
- **Batching:** two state updates in one click, one redraw with both new values.
- **A helper outside the components:** `calculateWinner` is plain JavaScript with no React in it. It is
  defined below `Board` and still usable inside it (function declarations are *hoisted*).
- **Calculated, not stored:** `winner` and `status` are computed from the state on every render, so they
  can never be out of date.
- **The ternary operator** `xIsNext ? 'X' : 'O'` is an `if`/`else` that gives a value.
- **Template literals** `` `Winner: ${winner}` `` build text with values in it: backticks, and `${…}` around
  each value. react.dev writes `'Winner: ' + winner`; template literals are today's way.
- **`for…of`** walks through an array item by item: `for (const [a, b, c] of lines)`. react.dev counts
  with `for (let i = 0; i < lines.length; i++)` and reads `lines[i]`.

## What changed

| Commit | What |
|---|---|
| immutability | only comments above `handleClick`: why a copy, and other ways to copy |
| taking turns | `xIsNext` state; early return on a filled square; `'X'` or `'O'` |
| winner | `calculateWinner()`; `winner` and `status`; `<div className="status">`; no moves after a win |

## Try it

1. Break the rule on purpose. Change `handleClick` to `squares[i] = 'X'; setSquares(squares);` and
   click. What do you see? What does `Board`'s state in React Developer Tools say? Undo it.
2. In the Console (F12), try: `const a = [1, 2]; const b = a; b.push(3); a` and then
   `const c = [1, 2]; const d = c.slice(); d.push(3); c`. Which one changed the original?
3. Remove the early return and click a filled square. What goes wrong? Put it back.
4. Play a full board where nobody wins. What does the status line say? (Stage 05's exercises fix it.)

## Exercise

Explain in two or three sentences, in your own words: why does the broken version in "Try it" 1 not show the
X, even though `squares` contains it? Then: let O start instead of X. Which single value do you change?
