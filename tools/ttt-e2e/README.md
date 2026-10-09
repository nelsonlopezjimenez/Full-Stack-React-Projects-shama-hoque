# ttt-e2e — browser checks for the Tic-Tac-Toe ladder

Checks every stage `teach/ch00-ttt-01-setup` … `teach/ch00-ttt-15-tests` in a real browser, the way
`../ladder-e2e/` does for the Ch03 client. Kept out of the course material on purpose: it is a tool for
the teacher, to re-check the ladder after fixing a stage and rebasing.

```bash
cd tools && npm install        # once: playwright-core, @babel/parser
node tools/ttt-e2e/run.mjs                 # all stages (from the repo root)
node tools/ttt-e2e/run.mjs --stages 10-12  # some stages
node tools/ttt-e2e/run.mjs --keep          # keep the temporary worktree to look around
```

## What it does

`run.mjs` makes a temporary git worktree in the system temp folder (your working folder is not touched),
checks out each stage, runs `npm ci` when the stage's lock file changed, and runs `check-stage.mjs` for it.
On the last stage it also runs `npm test` if the stage has tests (stage 15). Then it removes the worktree.

`check-stage.mjs <projectDir> <NN>` starts the stage's own `vite.config.js` on port **5220**, opens it in
headless Edge and runs scenario `sNN` from `scenarios.mjs`, then runs `vite build` into a temp folder. It fails on:

- a failed step (wrong squares, missing text, wrong move list),
- a page error, or any console error or warning the stage does not expect,
- an **expected** warning that does not appear (stage 10 must show React's missing-key warning),
- a failed build.

Scenarios: one per stage that changes behavior (01, 02, 04, 07, 08, 09, 10, 12). Stages that only
refactor re-run the previous scenario, so a refactor cannot silently break the game.

## Settings

| Variable | Default | |
|---|---|---|
| `TTT_VITE_PORT` | `5220` | port of the dev server (not 5173, which other chapters use) |
| `TTT_OUT` | `<temp>/ttt-e2e` | build output and failure screenshots |
| `TTT_DEBUG` | — | `1` prints every console message of the page |
| `LADDER_BROWSER`, `LADDER_HEADED` | `msedge`, — | from `../ladder-e2e/config.mjs`: which browser, and show its window |

## Why the build runs last

`vite.build()` sets `process.env.NODE_ENV = 'production'` for the whole Node process. A dev server
started after it in the same process serves React's **production** build, which prints no warnings,
so warning checks would silently pass. That is how it was found: stage 10's expected key warning never
appeared. `../ladder-e2e/check-stage.mjs` builds first, so its warning check is probably affected too.
