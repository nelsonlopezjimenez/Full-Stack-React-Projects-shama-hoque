# Stage 04 — Making an interactive component

**Branch:** `teach/ch00-ttt-04-interactive-square` (starts from `teach/ch00-ttt-03-props`)
**react.dev:** [Making an interactive component](https://react.dev/learn/tutorial-tic-tac-toe#making-an-interactive-component)
and [React Developer Tools](https://react.dev/learn/tutorial-tic-tac-toe#react-developer-tools)

## Goal

Click an empty square and an X appears in it.

## New ideas

- **Event handlers.** `handleClick` is a function, and `onClick={handleClick}` gives it to the button.
  React calls it on every click. Write the function, not a call: `onClick={handleClick()}` would run it
  while drawing.
- **State** is a component's memory. `const [value, setValue] = useState(null)` creates it:
  - `value` is the current value (`null` at first, so the square is empty),
  - `setValue('X')` changes it and makes React draw the component again (a **re-render**).
- **Why not a normal variable?** React calls `Square()` again for every redraw. A `let value` inside it
  would start from the beginning each time and forget the X.
- **Each component has its own state.** The nine squares are nine separate memories.
- **Imports from React:** `import { useState } from 'react'`.
- **React Developer Tools** is a browser extension that shows the components, their props and their state.

## What changed

| File | What |
|---|---|
| `src/App.jsx` | `useState` import; `Square` keeps `value` in state and sets it to `'X'` on click; `Board` passes no props anymore |

## Try it

1. Do the tutorial's first step: make `handleClick` run `console.log('clicked!')` instead of `setValue('X')`.
   Open the Console (F12 → **Console**, or **Shift + Ctrl + J**) and click a few squares. Then change it back.
2. Click a square twice. Does anything happen the second time? Why not?
3. Install React Developer Tools for your browser
   ([Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi),
   [Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/),
   [Edge](https://microsoftedge.microsoft.com/addons/detail/react-developer-tools/gpphkfbcpidddadnkolkpfckpihlkkil)).
   Open F12 → **Components**, select a `Square`, click it on the page and watch its **State** change.
4. Change `onClick={handleClick}` to `onClick={handleClick()}` and reload. Read the error in the
   Console, then undo the change. (Stage 05 explains it.)

## Exercise

Make a square switch back and forth: the first click shows X, the next click empties it again, and so on.
Hint: `handleClick` can look at `value` before it calls `setValue`.
