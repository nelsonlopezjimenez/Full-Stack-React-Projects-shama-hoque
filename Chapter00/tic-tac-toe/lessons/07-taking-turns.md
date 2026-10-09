# Stage 07 — Taking turns

**Branch:** `teach/ch00-ttt-07-taking-turns` (starts from `teach/ch00-ttt-06-immutability`)
**react.dev:** [Taking turns](https://react.dev/learn/tutorial-tic-tac-toe#taking-turns)

## Goal

X and O take turns, and a square that is already filled cannot be changed.

## New ideas

- **A second piece of state:** `const [xIsNext, setXIsNext] = useState(true)`. A component can call
  `useState` as many times as it needs.
- **Flipping a boolean:** `setXIsNext(!xIsNext)`. `!` turns `true` into `false` and back.
- **An early return** at the top of `handleClick`: `if (squares[i]) { return; }`. `null` is "falsy", so
  empty squares go on; `'X'` and `'O'` are "truthy", so filled squares stop here.
- **Several updates, one redraw.** `setSquares` and `setXIsNext` run one after the other, and React
  draws once afterwards, with both new values (this is called *batching*).

## What changed

| File | What |
|---|---|
| `src/App.jsx` | `xIsNext` state in `Board`; `handleClick` returns early on a filled square and writes `'X'` or `'O'` |

## Try it

1. Play a few moves: X, O, X, … Then click a filled square: nothing happens.
2. Remove the early return (the `if (squares[i])` block) and click a filled square. What goes wrong?
   Put it back.
3. In React Developer Tools, watch `Board`'s two states change with every click.

## Exercise

Let O start instead of X. Which single value do you have to change? Then change it back.
