# Stage 11 — Picking a key

**Branch:** `teach/ch00-ttt-11-keys` (starts from `teach/ch00-ttt-10-past-moves`)
**react.dev:** [Picking a key](https://react.dev/learn/tutorial-tic-tac-toe#picking-a-key)

## Goal

The warning from stage 10 is gone. The fix is one attribute: `<li key={move}>`.

## New ideas

- **What a key is for.** When a list changes, React compares the new list with the old one. The key
  tells it which item is which: a key it knows means "same item, keep it" (and its state), a new key
  means "create it", and a missing key means "remove it".
- **A good key is unique among its siblings and stable:** it stays the same for the same item.
  Data from a database usually has an id: `<li key={user.id}>`.
- **The index is usually a bad key.** Insert an item at the top, and every item gets a new index, so React
  matches the wrong ones. The tutorial uses `move` because moves are only ever added at the end.
- **`key` is special.** It looks like a prop, but React keeps it for itself; the component never sees it.

## What changed

| File | What |
|---|---|
| `src/App.jsx` | `<li key={move}>` in the `moves` list |

## Try it

1. Reload with the Console open (F12) and play a few moves: no warning now.
2. Switch to stage 10 and back (`git switch teach/ch00-ttt-10-past-moves`, then
   `git switch teach/ch00-ttt-11-keys`) and compare the Console each time.
3. Change the key to `key={1}` (the same for every item). Read the new warning. Undo it.

## Exercise

The tutorial's example list is `<li>Alexa: 7 tasks left</li>`, `<li>Ben: 5 tasks left</li>`, which then
becomes Ben, Claudia, Alexa. Explain in two sentences why `key={index}` would be a poor choice
for that list, and what you would use instead.
