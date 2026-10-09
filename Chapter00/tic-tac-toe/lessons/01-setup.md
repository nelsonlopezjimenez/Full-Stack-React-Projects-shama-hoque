# Stage 01 — Setup and the starter code

**Branch:** `teach/ch00-ttt-01-setup` (starts from `main`)
**react.dev:** [Setup for the tutorial](https://react.dev/learn/tutorial-tic-tac-toe#setup-for-the-tutorial) and
[Inspecting the starter code](https://react.dev/learn/tutorial-tic-tac-toe#inspecting-the-starter-code)

> **How to switch, compare and work on the stages:** read
> [`instructions/working-with-the-lesson-stages.md`](http://192.168.1.28:3000/s888888/Full-Stack-React-Projects-shama-hoque/src/branch/main/instructions/working-with-the-lesson-stages.md).
> It lives only on `main`, so the `instructions/` folder is not there while a stage is checked out.
> Read it in Gitea (branch `main`), or in the terminal:
> `git show origin/main:instructions/working-with-the-lesson-stages.md`

## Goal

The tutorial's starter code, running on your own computer: one square with an X in it.

## New ideas

- **A component** is a function that returns what to show. `Square` returns one `<button>`.
- **JSX** is the HTML-like part: `<button className="square">X</button>`. The browser cannot read it;
  Vite turns it into plain JavaScript first.
- **`export default`** makes `Square` the main thing that `App.jsx` offers. `main.jsx` imports it.
- **`className`** is JSX's name for the HTML `class` attribute. It connects the button to the
  `.square` rule in `styles.css`.
- **Vite** replaces CodeSandbox: `npm run dev` serves the app and reloads it when you save.

## What changed

| File | What |
|---|---|
| `package.json` | name, `"type": "module"`, scripts `dev` / `build` / `preview`, `react`, `react-dom`, `vite`, `@vitejs/plugin-react` |
| `package-lock.json` | the exact versions, so everybody installs the same thing |
| `.gitignore` | `node_modules/` and `dist/` (the build output) are never committed |
| `index.html` | the one HTML page, with the empty `<div id="root">` |
| `vite.config.js` | turns on the React plugin |
| `src/main.jsx` | the tutorial's `index.js`: starts React and loads `styles.css` |
| `src/App.jsx` | the tutorial's `App.js`: the `Square` component |
| `src/styles.css` | the tutorial's styles, unchanged |

## Try it

```bash
cd Chapter00/tic-tac-toe
npm install
npm run dev
```

1. Open http://localhost:5173. You see one square with an X.
2. Change the `X` in `App.jsx` to an `O` and save. The page updates by itself.
3. Open the developer tools (F12) → **Elements**. `<div id="root">` contains the `<button>`.
   Then **View page source** (Ctrl+U): the HTML that arrived is empty. React built the button.

## Exercise

Remove `className="square"` from the button and save. What changes on the page, and why?
Put it back afterwards.
