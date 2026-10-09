# Stage 12 — Implementing time travel

**Branch:** `teach/ch00-ttt-12-time-travel` (starts from `teach/ch00-ttt-11-keys`)
**react.dev:** [Implementing time travel](https://react.dev/learn/tutorial-tic-tac-toe#implementing-time-travel)

## Goal

The move buttons work: click *"Go to move #2"* and the board goes back to how it was after two moves.
If you play from there, the moves that came after are dropped and the game goes on from that point.

## New ideas

- **A state for "where are we":** `currentMove` (0 = game start). The board shown is
  `history[currentMove]`, no longer always the last board.
- **`jumpTo(nextMove)`** only changes `currentMove` (and whose turn it is). `history` stays as it was,
  so you can also jump forward again.
- **Dropping the future:** `history.slice(0, currentMove + 1)` keeps the boards up to the current one.
  The new board goes after them.
- **`%` (remainder):** `nextMove % 2 === 0` is true for 0, 2, 4, …: the moves after which it is X's turn.
- **Immutability pays off.** Every board in `history` is a separate, unchanged copy (stage 06), so
  going back is just picking an older item from the array.

## What changed

| File | What |
|---|---|
| `src/App.jsx` | `currentMove` state; `currentSquares = history[currentMove]`; `handlePlay` drops the moves after the current one; `jumpTo` sets `currentMove` and `xIsNext` |

## Try it

1. Play four moves, then click *"Go to move #2"*. Click *"Go to move #4"*: you are back.
2. Go to move #2 again and play a different square. How many buttons are in the list now? Why?
3. In React Developer Tools, watch `Game`'s three states while you jump: which one changes, which ones don't?

## Exercise

`xIsNext` and `currentMove` are two states, but one can always be calculated from the other. Write
down how. (The next stage does exactly this, so try it before you look.)
