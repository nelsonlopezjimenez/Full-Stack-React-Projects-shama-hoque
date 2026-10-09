# Stage 02 — Building the board

**Branch:** `teach/ch00-ttt-02-board` (starts from `teach/ch00-ttt-01-setup`)
**react.dev:** [Building the board](https://react.dev/learn/tutorial-tic-tac-toe#building-the-board)

## Goal

Nine squares in a 3 × 3 grid, numbered 1 to 9 so you can see where each one is.

## New ideas

- **A component returns one element.** Two `<button>`s next to each other are two elements, and you get
  the error *"Adjacent JSX elements must be wrapped in an enclosing tag"*.
- **Fragments**, `<>` and `</>`, wrap several elements into one without adding anything to the page.
- **`div`s with a `className`** group the buttons into rows. The CSS rule `.board-row:after` ends each row.
- **Names say what a thing is.** The component draws a board now, so it is renamed from `Square` to `Board`.
- **JSX comments** are written as `{/* … */}`, because the part between `{` and `}` is JavaScript.

## What changed

| File | What |
|---|---|
| `src/App.jsx` | `Square` → `Board`, returns a Fragment with three `board-row` divs of three numbered buttons |

## Try it

1. Before you look at the code: write two `<button className="square">X</button>` one after the
   other in the `return` of stage 01, without the Fragment. Read the error in the browser and in the terminal.
2. Wrap them in `<>…</>`. Now you see two squares.
3. Compare with this stage: `git diff teach/ch00-ttt-01-setup teach/ch00-ttt-02-board -- Chapter00/tic-tac-toe/src`
4. In the developer tools (F12) → **Elements**, look inside `<div id="root">`: there are three `div`s,
   but no element for the Fragment.

## Exercise

Replace the Fragment `<>…</>` with a `<div>`…`</div>`. Does the page look different? What do you see
in **Elements** now? Which one would you keep, and why?
