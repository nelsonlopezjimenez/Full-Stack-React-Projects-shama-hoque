# Stage 06 — Why immutability is important

**Branch:** `teach/ch00-ttt-06-immutability` (starts from `teach/ch00-ttt-05-lift-state`)
**react.dev:** [Why immutability is important](https://react.dev/learn/tutorial-tic-tac-toe#why-immutability-is-important)

## Goal

No new feature: this stage is about **one line** of stage 05, `const nextSquares = squares.slice();`.
The only change in the code is the comment above `handleClick`. Read it, then do "Try it".

## New ideas

- **Mutating** data changes it in place:
  ```js
  squares[0] = 'X';
  ```
- **Not mutating** (immutability) makes a new copy with the change and leaves the old one as it was:
  ```js
  const nextSquares = squares.slice();
  nextSquares[0] = 'X';
  ```
- **React compares old and new state** to decide whether something changed. A changed copy is a new
  array, so React sees the change. The same array, changed inside, looks like *no change*.
- **Old versions stay intact.** That is what makes undo/redo possible, and the "time travel" in stage 12.
- **Re-rendering:** when `Board`'s state changes, `Board` and all its `Square`s render again. That is
  normal and fast; don't try to avoid it. Immutability makes it cheap to *skip* parts that did not
  change, when you need to (see [`memo`](https://react.dev/reference/react/memo)).

## What changed

| File | What |
|---|---|
| `src/App.jsx` | comments above `handleClick` only; the code is the same as in stage 05 |

Check it: `git diff teach/ch00-ttt-05-lift-state teach/ch00-ttt-06-immutability -- Chapter00/tic-tac-toe/src`
shows only `//` lines.

## Try it

1. Break the rule on purpose. Change `handleClick` to:
   ```js
   function handleClick(i) {
     squares[i] = 'X';
     setSquares(squares);
   }
   ```
   Click a few squares. What do you see? Look at `Board`'s state in React Developer Tools: are the X's there?
2. Undo it. Now try the other ways to copy from the comment: `const nextSquares = [...squares];`
   and `setSquares(squares.with(i, 'X'));`. Both work.
3. In the browser Console, try:
   ```js
   const a = [1, 2]; const b = a; b.push(3); a   // what is a now?
   const c = [1, 2]; const d = c.slice(); d.push(3); c
   ```

## Exercise

Explain in two or three sentences, in your own words: why does the broken version in "Try it" 1 not
show the X, even though `squares` contains it?
