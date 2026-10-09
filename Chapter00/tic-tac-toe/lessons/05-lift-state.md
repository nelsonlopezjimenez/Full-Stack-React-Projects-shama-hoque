# Stage 05 — Lifting state up

**Branch:** `teach/ch00-ttt-05-lift-state` (starts from `teach/ch00-ttt-04-interactive-square`)
**react.dev:** [Lifting state up](https://react.dev/learn/tutorial-tic-tac-toe#lifting-state-up)

## Goal

The game looks the same as in stage 04: a click puts an X in a square. But now **`Board` owns all nine
values** in one array, which it needs later to find a winner.

## New ideas

- **Lifting state up.** When several components need the same data, keep the state in their common
  parent and pass it down as props. Here: `squares` moves from each `Square` up into `Board`.
- **An array as state:** `useState(Array(9).fill(null))`. Index `0` is the top-left square, `8` the bottom-right one.
- **Passing a function down.** `Square` cannot change `Board`'s state. `Board` gives it a function as a
  prop (`onSquareClick`), and `Square` calls it.
- **`() => handleClick(0)`** is an arrow function: a small new function that calls `handleClick(0)` *later*.
  `onSquareClick={handleClick(0)}` would call it immediately, during drawing, and end in
  *"Too many re-renders"*.
- **Copy, then set:** `squares.slice()` copies the array, the copy gets the X, `setSquares` stores it.
  Stage 06 is about why.

## What changed

| File | What |
|---|---|
| `src/App.jsx` | `Square({ value, onSquareClick })` without state; `Board` has `squares` state and `handleClick(i)`, and passes `value` and `onSquareClick` to every square |

## Try it

1. Follow the tutorial's path: first `handleClick()` without a parameter that always fills
   `nextSquares[0]`. Which square gets the X when you click the middle one?
2. Change `onSquareClick={() => handleClick(0)}` to `onSquareClick={handleClick(0)}` and read the error.
   Undo it.
3. In React Developer Tools, select `Board`: its state is now the whole `squares` array. Click squares
   and watch it change. Select a `Square`: it only has props.

## Exercise

Add a line above the rows that shows how many squares are filled, for example *"Filled: 3"*.
Hint: `squares.filter(...)` returns a new array with only the entries you keep; its `.length` is the count.
Which component must this line go in, and why?
