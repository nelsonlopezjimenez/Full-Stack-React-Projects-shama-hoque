# Stage 10 — Showing the past moves

**Branch:** `teach/ch00-ttt-10-past-moves` (starts from `teach/ch00-ttt-09-lift-state-again`)
**react.dev:** [Showing the past moves](https://react.dev/learn/tutorial-tic-tac-toe#showing-the-past-moves)

## Goal

Next to the board, a list of buttons: *"Go to game start"*, *"Go to move #1"*, … one per board in the
history. Clicking them does nothing yet.

## New ideas

- **Arrays of JSX.** React can draw an array of elements. `{moves}` inside `<ol>` draws every `<li>`.
- **`map()`** turns one array into another: `history.map((squares, move) => <li>…</li>)` gives one
  `<li>` per board. The second parameter, `move`, is the index (0, 1, 2, …).
- **An unfinished function on purpose:** `jumpTo` exists so the buttons can call it, but its body is
  still `// TODO`.
- **A React warning in the Console:** *"Each child in a list should have a unique "key" prop."* The
  page still works. **This stage leaves it in on purpose**; stage 11 is about it.

## What changed

| File | What |
|---|---|
| `src/App.jsx` | `Game` gets an empty `jumpTo(nextMove)` and a `moves` list made with `history.map`, shown in the `<ol>` |

## Try it

1. Play three moves and watch the list grow.
2. Open the Console (F12) and find the "key" warning. Which component does it name?
3. Click "Go to game start": nothing happens yet. Why? (Look at `jumpTo`.)

## Exercise

Change the description so that the buttons say *"Go to move #1 (X)"*, *"Go to move #2 (O)"*, … X makes
the odd moves and O the even ones. Hint: `move % 2` is `1` for odd numbers and `0` for even ones.
