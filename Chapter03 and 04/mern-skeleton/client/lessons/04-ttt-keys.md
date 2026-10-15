# Client stage 04 — Tic-Tac-Toe 3: history, a list of moves, keys

**Branch:** `teach/ch03-client-04-ttt-keys` (starts from `teach/ch03-client-03-ttt-winner`)
**react.dev:** [Adding time travel](https://react.dev/learn/tutorial-tic-tac-toe#adding-time-travel):
[Storing a history of moves](https://react.dev/learn/tutorial-tic-tac-toe#storing-a-history-of-moves),
[Lifting state up, again](https://react.dev/learn/tutorial-tic-tac-toe#lifting-state-up-again),
[Showing the past moves](https://react.dev/learn/tutorial-tic-tac-toe#showing-the-past-moves),
[Picking a key](https://react.dev/learn/tutorial-tic-tac-toe#picking-a-key)

## Goal

The game plays as before, but it now **remembers every board** of the game, one per move, and shows a list
of buttons next to the board: *"Go to game start"*, *"Go to move #1"*, … The buttons do nothing yet
(stage 05), and the Console shows **no** warning about keys.

## Build it yourself first

Start from the end of stage 03 and copy this note into your branch:

```bash
git fetch upstream
git switch --no-track -c my/ch03-client-04-ttt-keys upstream/teach/ch03-client-03-ttt-winner
git restore --source=upstream/teach/ch03-client-04-ttt-keys -- ":/Chapter03 and 04/mern-skeleton/client/lessons/04-ttt-keys.md"
```

**What must be running:** only the client (`npm run dev`). No server, no database.

**Your task** (three steps, one commit each in the finished stage):

1. **History, and lifting state up again:** a new top-level component `Game` owns `history` (an array of
   boards, starting with one empty board) and `xIsNext`. `Board` loses its state and gets `xIsNext`,
   `squares` and `onPlay` as props. `Game` becomes the `export default`. Does `App.jsx` need a change?
2. **Showing the past moves:** `history.map(...)` turns every board into an `<li>` with a button, shown in
   an `<ol>` next to the board. `jumpTo(move)` exists but its body is empty. Open the Console: React warns
   about a missing `key`. Leave it for one step.
3. **Picking a key:** fix the warning with one attribute.

**Done when:** the list grows by one button per move, and the Console has no warnings.

**Compare** (from the `client` folder):

```bash
git diff upstream/teach/ch03-client-04-ttt-keys -- src
git log --oneline upstream/teach/ch03-client-03-ttt-winner..upstream/teach/ch03-client-04-ttt-keys
```

## New ideas

- **History:** `[board after 0 moves, board after 1 move, …]`. Because every move made a *copy*
  (stage 03), old boards were never changed and can simply be kept.
- **Lifting state up, again:** state moves up one more level, from `Board` into `Game`. `Board` becomes a
  **controlled component**: it shows its props and reports moves through `onPlay`.
- **Spread syntax:** `[...history, nextSquares]` is a new array with all the old items plus one.
- **The default export moves** from `Board` to `Game`. `App.jsx` imports "the default export" under the
  name `TicTacToe`, so it does not change.
- **Arrays of JSX.** `{moves}` inside `<ol>` draws every `<li>` of an array. `map((squares, move) => …)`
  gives each item and its index.
- **Keys.** When a list changes, React matches old and new items by their `key`: same key = same item
  (keep it, with its state), new key = create it, missing key = remove it. A key must be unique among its
  siblings and stay the same for the same item.
- **The index is usually a bad key**, because inserting an item gives every item after it a new index.
  `move` is fine here: moves are only added at the end. Data from a database has a better key, its id.
  You will use exactly that in stage 06: `<li key={user._id}>`.

## What changed

| Commit | What |
|---|---|
| lift state again | new `Game` (default export) with `history`, `xIsNext`, `handlePlay` and the `game` / `game-board` / `game-info` layout; `Board({ xIsNext, squares, onPlay })` |
| past moves | `jumpTo(nextMove)` (empty) and a `moves` list from `history.map`, shown in `<ol>` |
| keys | `<li key={move}>` |

## Try it

1. React Developer Tools: select `Game` and watch `history` grow by one board per move. `Board` has no
   state now, only props.
2. Switch to the middle commit of this stage and look at the Console: the key warning names `Game`.
   (`git log` as above, then `git switch --detach <id>`, and back with `git switch -`.)
3. Change the key to `key={1}` (the same for every item) and read the new warning. Undo it.

## Exercise

Change the button text to *"Go to move #1 (X)"*, *"Go to move #2 (O)"*, … X makes the odd moves and O the
even ones (`move % 2`). Then explain in two sentences why `key={index}` would be a poor choice for a list of
users that can be sorted by name, and what you would use instead.
