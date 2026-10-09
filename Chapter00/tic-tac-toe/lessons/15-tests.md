# Stage 15 — Tests

**Branch:** `teach/ch00-ttt-15-tests` (starts from `teach/ch00-ttt-14-split-files`)
**Background:** [Vitest](https://vitest.dev/guide/), [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)

## Goal

`npm test` checks the game automatically: 11 tests in three levels, from the simplest to the whole game.
The app itself does not change.

## New ideas

- **Vitest** runs the tests. It reuses `vite.config.js`, so tests understand JSX like the app.
- **jsdom** is a fake browser inside Node: components render into it, and the tests click on it.
- **React Testing Library** renders components (`render`) and finds things the way a person does
  (`screen.getByText`, `getAllByRole('button')`). `fireEvent.click` clicks.
- **Three levels:**
  1. `1-calculateWinner.test.js`: a **pure function**. Call it, check the result. No React at all.
  2. `2-Board.test.jsx`: **one component** with props. `vi.fn()` is a fake `onPlay` that records how it
     was called, so the test can check that Board reports a new board and never changes the old one.
  3. `3-Game.test.jsx`: **the whole game**, as a player sees it: click, read the page.
- **Why the split in stage 14 helps:** the first two levels import a single file each.

## What changed

| File | What |
|---|---|
| `package.json`, `package-lock.json` | scripts `test` and `test:watch`; `vitest`, `jsdom`, `@testing-library/react`, `@testing-library/jest-dom` |
| `vite.config.js` | `test` block: jsdom, setup file |
| `src/test/setup.js` | jest-dom matchers (`toBeInTheDocument`, `toHaveTextContent`), clean page after each test |
| `src/test/1-calculateWinner.test.js` | level 1 |
| `src/test/2-Board.test.jsx` | level 2 |
| `src/test/3-Game.test.jsx` | level 3 |
| `README.md` | how to run the tests |

## Try it

```bash
cd Chapter00/tic-tac-toe
npm install        # the new packages
npm test
```

1. All 11 tests pass.
2. Break the game on purpose: in `Game.jsx`, change
   `[...history.slice(0, currentMove + 1), nextSquares]` to `[...history, nextSquares]`. Run `npm test`:
   which test fails, and what does its message say? Undo it.
3. Run `npm run test:watch`, then change `'Winner: '` in `Board.jsx` to `'Won: '` and save. Watch the
   tests run again by themselves. Undo it and stop with `q`.

## Exercise

Add a test to `3-Game.test.jsx` that clicks the same square twice and checks that it still shows X
and that it is O's turn. Then pick one of the "Wrapping up" exercises from lesson 13 and write its
test **first**, before the code. The test fails; now make it pass.
