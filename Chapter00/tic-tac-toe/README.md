# Tic-Tac-Toe — the react.dev tutorial, one stage per section

This is React's official tutorial, [Tutorial: Tic-Tac-Toe](https://react.dev/learn/tutorial-tic-tac-toe),
built step by step in a local Vite project instead of CodeSandbox. There is no server and no database:
only React.

Every section of the tutorial is one **stage**, and every stage is a branch that starts from the stage
before it. So the difference between two stages is exactly what that section asks you to type:

```bash
git diff teach/ch00-ttt-07-taking-turns teach/ch00-ttt-08-winner -- Chapter00/tic-tac-toe
```

> **How to switch, compare and work on the stages:** read
> [`instructions/working-with-the-lesson-stages.md`](http://192.168.1.28:3000/s888888/Full-Stack-React-Projects-shama-hoque/src/branch/main/instructions/working-with-the-lesson-stages.md).
> It lives only on `main`, so the `instructions/` folder is not there while a stage is checked out.
> Read it in Gitea (branch `main`), or in the terminal:
> `git show origin/main:instructions/working-with-the-lesson-stages.md`

## Run it

You need Node.js 22.22 or newer (`node -v`).

```bash
cd Chapter00/tic-tac-toe
npm install
npm run dev
```

Open the address Vite prints (normally http://localhost:5173).

From stage 15 on, `npm test` runs the tests (`npm run test:watch` runs them again on every save).

## The stages

Read the lesson note of a stage (`lessons/NN-name.md`) next to the react.dev section it links to.

| # | Branch | react.dev section |
|---|---|---|
| 01 | `teach/ch00-ttt-01-setup` | Setup for the tutorial, Inspecting the starter code |
| 02 | `teach/ch00-ttt-02-board` | Building the board |
| 03 | `teach/ch00-ttt-03-props` | Passing data through props |
| 04 | `teach/ch00-ttt-04-interactive-square` | Making an interactive component, React Developer Tools |
| 05 | `teach/ch00-ttt-05-lift-state` | Lifting state up |
| 06 | `teach/ch00-ttt-06-immutability` | Why immutability is important |
| 07 | `teach/ch00-ttt-07-taking-turns` | Taking turns |
| 08 | `teach/ch00-ttt-08-winner` | Declaring a winner |
| 09 | `teach/ch00-ttt-09-lift-state-again` | Storing a history of moves, Lifting state up, again |
| 10 | `teach/ch00-ttt-10-past-moves` | Showing the past moves |
| 11 | `teach/ch00-ttt-11-keys` | Picking a key |
| 12 | `teach/ch00-ttt-12-time-travel` | Implementing time travel |
| 13 | `teach/ch00-ttt-13-final-cleanup` | Final cleanup, Wrapping up |
| 14 | `teach/ch00-ttt-14-split-files` | *(after the tutorial)* one component per file |
| 15 | `teach/ch00-ttt-15-tests` | *(after the tutorial)* tests with Vitest and Testing Library |

## Differences from the tutorial

- **Vite instead of CodeSandbox.** The tutorial's `index.js` is `src/main.jsx` here, and `App.js` is
  `src/App.jsx` (Vite expects JSX in `.jsx` files). `index.html` is in the project folder, not in `public/`.
- **From stage 14 on**, the code of `App.jsx` is split into `Square.jsx`, `Board.jsx`, `Game.jsx` and
  `calculateWinner.js`.
- **Comments.** The code is the tutorial's code. The `[BEGINNER]` and `[ADVANCED]` comments are ours:
  `[BEGINNER]` explains what you see, `[ADVANCED]` gives background you can skip the first time.

## Credit

The tutorial's text and code are by the React team, from [react.dev](https://react.dev/learn/tutorial-tic-tac-toe),
under the [Creative Commons Attribution 4.0](https://creativecommons.org/licenses/by/4.0/) license.
The comments, the lesson notes, stages 14–15 and the Vite setup were added for this course.
