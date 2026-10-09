# Stage 13 — Final cleanup (the end of the tutorial)

**Branch:** `teach/ch00-ttt-13-final-cleanup` (starts from `teach/ch00-ttt-12-time-travel`)
**react.dev:** [Final cleanup](https://react.dev/learn/tutorial-tic-tac-toe#final-cleanup) and
[Wrapping up](https://react.dev/learn/tutorial-tic-tac-toe#wrapping-up)

## Goal

The game works exactly as in stage 12, with **one state less**. Without the comments, this `App.jsx`
is the tutorial's final code.

## New ideas

- **Redundant state.** `xIsNext` is `true` exactly when `currentMove` is even. Two states that always
  have to agree are two chances to forget an update.
- **Derive instead of store:** `const xIsNext = currentMove % 2 === 0;` is calculated on every render,
  so it can never be out of sync. `setXIsNext` disappears from `handlePlay` and `jumpTo`.
- **Rule of thumb:** keep the *smallest* state you need, and calculate everything else from it
  (like `currentSquares`, `winner` and `status`).

## What changed

| File | What |
|---|---|
| `src/App.jsx` | the `xIsNext` state is gone; `xIsNext` is calculated from `currentMove`; no more `setXIsNext` calls |

## Try it

1. Play, jump back, play again: everything works as in stage 12.
2. In React Developer Tools, `Game` has two states now: `history` and `currentMove`.
3. Look at the whole game in one diff:
   `git diff teach/ch00-ttt-01-setup teach/ch00-ttt-13-final-cleanup -- Chapter00/tic-tac-toe/src/App.jsx`

## Exercises — the tutorial's "Wrapping up" ideas

From easiest to hardest. Do them on your own branch (see the instructions linked from
[`../README.md`](../README.md)). The teacher has the answers.

1. For the current move only, show *"You are at move #…"* instead of a button.
2. Rewrite `Board` to use two loops to make the squares instead of hardcoding them.
3. Add a toggle button that lets you sort the moves in either ascending or descending order.
4. When someone wins, highlight the three squares that caused the win (and when no one wins, display
   a message about the result being a draw).
5. Display the location for each move in the format (row, col) in the move history list.

Hints: (1) compare `move` with `currentMove` inside `map`. (2) `map` inside `map`, and every `Square`
needs a `key` now. (3) a new boolean state; `.toReversed()` gives a reversed copy. (4) let
`calculateWinner` also return *which* line won; a draw is a full board without a winner.
(5) the history only stores boards: find the square that changed, or store more per move.

Next on react.dev: [Thinking in React](https://react.dev/learn/thinking-in-react).
