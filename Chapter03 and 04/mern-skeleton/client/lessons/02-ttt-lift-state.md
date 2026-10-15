# Client stage 02 — Tic-Tac-Toe 1: a board you can click

**Branch:** `teach/ch03-client-02-ttt-lift-state` (starts from `teach/ch03-client-01-hello`)
**react.dev:** [Tutorial: Tic-Tac-Toe](https://react.dev/learn/tutorial-tic-tac-toe), from
[Setup for the tutorial](https://react.dev/learn/tutorial-tic-tac-toe#setup-for-the-tutorial) to
[Lifting state up](https://react.dev/learn/tutorial-tic-tac-toe#lifting-state-up)

> **Stages 02–05 are React's official tutorial**, built inside this client, one tutorial section per commit.
> There is no server and no database in them, only React. Stage 06 puts the game away and goes back to the
> MERN app, where you use every idea from here again: components, props, state, events, lists and keys.

## Goal

A 3 × 3 board below the "MERN Skeleton" heading. Click an empty square and an X appears in it.
`Board` remembers all nine squares in **one** array, which it will need to find a winner in stage 03.

## Build it yourself first

Try the goal on your own before you look at this stage's code. Start from the end of stage 01 and
copy this note into your branch:

```bash
git fetch upstream
git switch --no-track -c my/ch03-client-02-ttt-lift-state upstream/teach/ch03-client-01-hello
git restore --source=upstream/teach/ch03-client-02-ttt-lift-state -- ":/Chapter03 and 04/mern-skeleton/client/lessons/02-ttt-lift-state.md"
```

The note appears as a new file; commit it together with your work.

**What must be running:** only the client (`cd client`, `npm install`, `npm run dev`). The Express server
and MongoDB are **not** needed for stages 02–05.

**Your task:** read the tutorial from "Setup for the tutorial" to the end of "Lifting state up" and type
the code yourself (typing teaches more than pasting). Two differences from the tutorial:

- The tutorial's `App.js` is `src/tic-tac-toe/TicTacToe.jsx` here, and its `styles.css` is
  `src/tic-tac-toe/styles.css`. The CSS is not the lesson, so copy it from the tutorial's sandbox, or
  take it from the finished stage:
  `git restore --source=upstream/teach/ch03-client-02-ttt-lift-state -- ":/Chapter03 and 04/mern-skeleton/client/src/tic-tac-toe/styles.css"`.
  `TicTacToe.jsx` imports the CSS itself: `import './styles.css';`.
- The tutorial's `index.js` is our `main.jsx`, which stays as it is. Instead, `App.jsx` imports the game
  and shows `<TicTacToe />` where the "Hello from React." paragraph was.

Five steps, one commit each in the finished stage:

1. **Starter code:** a `Square` component that returns `<button className="square">X</button>`.
2. **Building the board:** nine buttons in three `<div className="board-row">`, inside a Fragment `<>…</>`.
3. **Passing data through props:** `Square({ value })`, and `Board` renders `<Square value="1" />` …
4. **Making an interactive component:** `useState` in `Square`; a click sets its value to `'X'`.
5. **Lifting state up:** the state moves into `Board` as `squares` (an array of 9); `Square` gets
   `value` and `onSquareClick` as props.

**Done when:** every empty square shows an X when clicked, and React Developer Tools (see "Try it")
shows the `squares` array on `Board`, while `Square` has only props.

**Compare** with the finished stage (from the `client` folder), all at once or one step at a time:

```bash
git diff upstream/teach/ch03-client-02-ttt-lift-state -- src
git log --oneline upstream/teach/ch03-client-01-hello..upstream/teach/ch03-client-02-ttt-lift-state
git show <commit id> -- src
```

The tutorial uses semicolons and `function` declarations; the rest of this client (and the book) leaves the
semicolons out and uses arrow functions. Both are fine, and the game keeps the tutorial's style so you can
compare it with react.dev. Where react.dev uses an older form of the syntax, the game uses today's instead
(from stage 03: template literals, `const` with a ternary instead of `let` + `if`/`else`, and `for…of`).
A comment at each of those places shows react.dev's version.

## New ideas

- **A component returns one element.** Two `<button>`s side by side are two elements, and JSX says
  *"Adjacent JSX elements must be wrapped in an enclosing tag"*. A **Fragment** `<>…</>` wraps them
  without adding anything to the page.
- **`className`** is JSX's name for the HTML `class` attribute; it connects an element to a CSS rule.
- **Reusable components and props.** One `Square` written once, used nine times. Props pass data from a
  parent to a child: `<Square value="1" />`, read with `function Square({ value })`. `{value}` inside JSX
  shows the value; without the braces you would see the word "value".
- **Your components start with a capital letter** (`<Square />`); lowercase tags are HTML (`<button>`).
- **Event handlers.** `onClick={handleClick}` gives React a function to call on a click. Write the function,
  not a call: `onClick={handleClick()}` would run it while drawing.
- **State is a component's memory.** `const [value, setValue] = useState(null)`. Calling `setValue('X')`
  stores the new value and makes React draw the component again (a **re-render**). A normal `let` variable
  would start over on every render. Each component has its own state.
- **Lifting state up.** When several components need the same data, keep it in their common parent and pass
  it down as props. `Board` owns `squares`; `Square` only shows `value` and calls `onSquareClick`.
- **Passing a function down:** `onSquareClick={() => handleClick(0)}`. The arrow function calls
  `handleClick(0)` later, on the click. `onSquareClick={handleClick(0)}` would call it now, set state,
  render again, call it again… *"Too many re-renders"*.
- **Copy, then set:** `squares.slice()` copies the array; the copy gets the X; `setSquares` stores it.
  Stage 03 explains why.

## What changed

| Commit | File | What |
|---|---|---|
| starter Square | `src/tic-tac-toe/TicTacToe.jsx`, `styles.css`, `src/App.jsx` | the tutorial's starter code; `App` shows `<TicTacToe />` |
| board | `TicTacToe.jsx` | `Square` → `Board`: a Fragment with three rows of numbered buttons |
| props | `TicTacToe.jsx` | `Square({ value })`; `Board` renders nine `<Square value="…" />` |
| interactive square | `TicTacToe.jsx` | `useState` in `Square`; a click sets `'X'` |
| lift state | `TicTacToe.jsx` | `squares` state and `handleClick(i)` in `Board`; `Square` gets `value` and `onSquareClick` |

`README.md` lists the new folder.

## Try it

1. Before you write `Board`: put two `<button className="square">X</button>` one after the other in the
   `return` without a Fragment. Read the error in the browser and in the terminal. Then add `<>…</>`.
2. In step 4, first make `handleClick` run `console.log('clicked!')`, open the Console (F12) and click.
3. Install **React Developer Tools**
   ([Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi),
   [Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/),
   [Edge](https://microsoftedge.microsoft.com/addons/detail/react-developer-tools/gpphkfbcpidddadnkolkpfckpihlkkil)).
   F12 → **Components**: select `Board` and watch `squares` change while you click. Notice `App` above it:
   the game is just one more component in the client.
4. Change `onSquareClick={() => handleClick(0)}` to `onSquareClick={handleClick(0)}` and read the error. Undo it.

More detail on each step is in the separate Tic-Tac-Toe ladder, one note per tutorial section, for example:
`git show upstream/teach/ch00-ttt-05-lift-state:Chapter00/tic-tac-toe/lessons/05-lift-state.md`

## Exercise

Add a line above the rows that shows how many squares are filled, for example *"Filled: 3"*.
Hint: `squares.filter(...)` returns a new array with only the entries you keep; its `.length` is the count.
Which component must this line go in, and why?
