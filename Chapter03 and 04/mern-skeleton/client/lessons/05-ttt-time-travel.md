# Client stage 05 — Tic-Tac-Toe 4: time travel and final cleanup

**Branch:** `teach/ch03-client-05-ttt-time-travel` (starts from `teach/ch03-client-04-ttt-keys`)
**react.dev:** [Implementing time travel](https://react.dev/learn/tutorial-tic-tac-toe#implementing-time-travel),
[Final cleanup](https://react.dev/learn/tutorial-tic-tac-toe#final-cleanup),
[Wrapping up](https://react.dev/learn/tutorial-tic-tac-toe#wrapping-up)

## Goal

The move buttons work: click *"Go to move #2"* and the board goes back to how it was after two moves. Play
from there, and the moves that came after are dropped. Then the same game with **one state less**.
Without the comments, `TicTacToe.jsx` is the tutorial's final code.

## Build it yourself first

Start from the end of stage 04 and copy this note into your branch:

```bash
git fetch upstream
git switch --no-track -c my/ch03-client-05-ttt-time-travel upstream/teach/ch03-client-04-ttt-keys
git restore --source=upstream/teach/ch03-client-05-ttt-time-travel -- ":/Chapter03 and 04/mern-skeleton/client/lessons/05-ttt-time-travel.md"
```

**What must be running:** only the client (`npm run dev`). No server, no database.

**Your task** (two steps, one commit each):

1. **Time travel:** a new state `currentMove` (0 = game start). The board shown is `history[currentMove]`.
   `jumpTo(nextMove)` sets `currentMove` (and whose turn it is). `handlePlay` keeps only the boards up to the
   current one before it adds the new board.
2. **Final cleanup:** `xIsNext` is `true` exactly when `currentMove` is even. Replace the `xIsNext` state with
   a calculated value and remove every `setXIsNext` call.

**Done when:** you can play four moves, jump to move #2, jump to #4 again, go back to #2 and play a
different square (the list gets shorter). React Developer Tools shows only `history` and `currentMove` on `Game`.

**Compare** (from the `client` folder):

```bash
git diff upstream/teach/ch03-client-05-ttt-time-travel -- src
git diff upstream/teach/ch03-client-01-hello upstream/teach/ch03-client-05-ttt-time-travel -- src   # the whole game
```

## New ideas

- **A state for "where are we":** `currentMove`. `history` is not changed by a jump, so you can jump forward again.
- **Dropping the future:** `history.slice(0, currentMove + 1)` keeps the boards up to the current one.
- **`%` (remainder):** `nextMove % 2 === 0` is true for 0, 2, 4, …
- **Immutability pays off.** Every board in `history` is a separate, unchanged copy, so going back is just
  picking an older item.
- **Redundant state.** Two states that always have to agree are two chances to forget an update.
  **Derive instead of store:** `const xIsNext = currentMove % 2 === 0;` can never be out of sync.
- **Rule of thumb:** keep the *smallest* state you need and calculate the rest (`currentSquares`, `winner`,
  `status`, `xIsNext`).

## What changed

| Commit | What |
|---|---|
| time travel | `currentMove` state; `currentSquares = history[currentMove]`; `handlePlay` drops later moves; `jumpTo` works |
| final cleanup | the `xIsNext` state is gone; `xIsNext` is calculated from `currentMove` |

## Try it

1. Play four moves, click *"Go to move #2"*, then *"Go to move #4"*: you are back.
2. Go to move #2 and play a different square. How many buttons are in the list now? Why?
3. React Developer Tools: watch `Game`'s states while you jump. Which one changes?

## Exercises — the tutorial's "Wrapping up" ideas

From easiest to hardest:

1. For the current move only, show *"You are at move #…"* instead of a button.
2. Rewrite `Board` to use two loops to make the squares instead of hardcoding them.
3. Add a toggle button that sorts the moves in ascending or descending order.
4. When someone wins, highlight the three squares that caused the win (and show a draw message when nobody wins).
5. Show the location of each move as (row, col) in the move history list.

Hints: (1) compare `move` with `currentMove` inside `map`. (2) `map` inside `map`; every `Square` needs a
`key` now. (3) a new boolean state; `.toReversed()` gives a reversed copy. (4) let `calculateWinner` also
return *which* line won; a draw is a full board without a winner. (5) the history only stores boards: find
the square that changed, or store more per move.

## What you take into stage 06

| In the game | In the MERN app (stage 06 on) |
|---|---|
| `useState` for the board | `useState` for the list of users loaded from the server |
| a click calls `setSquares` | the server's answer calls `setUsers` |
| `history.map(...)` → `<li key={move}>` | `users.map(...)` → `<li key={user._id}>` |
| props down, functions up (`onPlay`) | the same (`onCreated` in stage 07) |
| everything happens in the browser | new: an **effect** that talks to the server with `fetch` |

Stage 06 puts the game away (it stays in stages 02–05) and shows the users from MongoDB instead.
