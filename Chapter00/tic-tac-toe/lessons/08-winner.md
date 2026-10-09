# Stage 08 — Declaring a winner

**Branch:** `teach/ch00-ttt-08-winner` (starts from `teach/ch00-ttt-07-taking-turns`)
**react.dev:** [Declaring a winner](https://react.dev/learn/tutorial-tic-tac-toe#declaring-a-winner)

## Goal

A line above the board says *"Next player: X"* or *"Winner: O"*, and after a win no more moves are possible.

## New ideas

- **A helper function outside the components.** `calculateWinner(squares)` is plain JavaScript: it
  checks the eight winning lines and returns `'X'`, `'O'` or `null`.
- **Values calculated during rendering.** `winner` and `status` are not state. They are computed from
  `squares` and `xIsNext` every time `Board` renders, so they are always right.
- **`||` in a condition:** `if (calculateWinner(squares) || squares[i])` stops the click if *either* is true.
- **The ternary operator** `xIsNext ? 'X' : 'O'` is an `if`/`else` that gives a value.
- **Hoisting:** `calculateWinner` is written below `Board` but can be used inside it.

## What changed

| File | What |
|---|---|
| `src/App.jsx` | `calculateWinner()` at the end; `Board` computes `winner` and `status`, shows `<div className="status">`, and ignores clicks after a win |

## Try it

1. Win with X along the top row. Try to click another square.
2. Play a full board where nobody wins. What does the status line say? (You'll fix that in the
   last lesson's exercises.)
3. In the Console (F12), `calculateWinner` is not reachable: it lives inside the module. Copy the
   function into the Console and call it: `calculateWinner(['O', 'O', 'O', null, null, null, null, null, null])`.

## Exercise

Write down the `lines` entry for each of these wins, without looking at the code: the middle column,
and the diagonal from the top right to the bottom left. Then check your answer in `calculateWinner`.
