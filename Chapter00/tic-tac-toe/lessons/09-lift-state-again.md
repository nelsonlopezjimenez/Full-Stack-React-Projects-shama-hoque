# Stage 09 — Storing a history, lifting state up again

**Branch:** `teach/ch00-ttt-09-lift-state-again` (starts from `teach/ch00-ttt-08-winner`)
**react.dev:** [Storing a history of moves](https://react.dev/learn/tutorial-tic-tac-toe#storing-a-history-of-moves)
and [Lifting state up, again](https://react.dev/learn/tutorial-tic-tac-toe#lifting-state-up-again)

## Goal

The game plays exactly as before, but it now **remembers every board** of the game, one per move. This
prepares "time travel" (going back to an earlier move) in stages 10–12.

## New ideas

- **History:** an array of boards, `[board after 0 moves, board after 1 move, …]`. Because every move
  made a *copy* (stage 06), the old boards were never changed and can simply be kept.
- **Lifting state up, again:** a new top-level component, `Game`, owns `history` and `xIsNext`.
  `Board` loses its state and gets `xIsNext`, `squares` and `onPlay` as props.
- **A controlled component:** `Board` only shows its props and reports moves through `onPlay`.
  It no longer decides anything on its own.
- **Spread syntax:** `[...history, nextSquares]` makes a new array with all the old items plus one.
- **The last item:** `history[history.length - 1]`.
- **The default export moves:** `Game` is the main component now; `main.jsx` still imports "the
  default export" and does not need to change.

## What changed

| File | What |
|---|---|
| `src/App.jsx` | new `Game` (the default export) with `history`, `xIsNext`, `handlePlay`, and the `game` / `game-board` / `game-info` layout; `Board({ xIsNext, squares, onPlay })` without state calls `onPlay(nextSquares)` |

## Try it

1. Play a game: everything works as in stage 08.
2. In React Developer Tools, select `Game` and watch `history` grow by one board with every move.
   Select `Board`: no state, only props.
3. Look at `main.jsx`. Why did it not need any change, even though the component it imports is now
   called `Game` instead of `Board`?

## Exercise

Show the number of moves played so far in the `game-info` area, above the `<ol>`, for example
*"Moves: 4"*. Which value already holds that number, without any new state?
