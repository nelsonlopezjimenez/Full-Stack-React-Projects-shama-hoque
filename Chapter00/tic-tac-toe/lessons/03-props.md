# Stage 03 — Passing data through props

**Branch:** `teach/ch00-ttt-03-props` (starts from `teach/ch00-ttt-02-board`)
**react.dev:** [Passing data through props](https://react.dev/learn/tutorial-tic-tac-toe#passing-data-through-props)

## Goal

The same board, but the button is written once, in a `Square` component, and `Board` tells each
square which number to show.

## New ideas

- **Reusable components.** Nine copies of the same `<button>` would mean nine places to change later.
  One `Square` component is one place.
- **Props** pass data from a parent (`Board`) to a child (`Square`): `<Square value="1" />`.
- **Reading a prop:** `function Square({ value })`. The `{ }` in the parameter list picks `value` out of
  the props object.
- **`{value}` in JSX** shows a JavaScript value. Without the braces you would see the text "value".
- **Capital letters:** `<Square />` is your component; `<button>` is an HTML element.

## What changed

| File | What |
|---|---|
| `src/App.jsx` | new `Square({ value })`; `Board` renders nine `<Square value="…" />` |

## Try it

1. Change `{value}` in `Square` to `value` (no braces) and save. What do the squares show? Undo it.
2. The tutorial takes a detour: first `<Square />` without props, so every square shows "1". Try it by
   changing `{value}` to `1`. Why do all nine squares look the same?
3. Install **React Developer Tools** (a browser extension, see stage 04) and click a square in the
   **Components** tab: you can see its `value` prop.

## Exercise

Give `Square` a second prop, `color`, and use it as `style={{ color: color }}` on the button. Make the
middle square red: `<Square value="5" color="red" />`. What happens to the squares that get no `color`?
