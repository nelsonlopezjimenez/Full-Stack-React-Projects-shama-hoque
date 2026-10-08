# Ladder end-to-end checks

Instructor tooling, not course material. These scripts check that every stage of the Chapter 3/4 client
ladder (`teach/ch03-client-01-hello` … `teach/ch03-client-16-tests`) still builds and still works in a real
browser. Run them after fixing a stage and rebasing, before pushing.

They were written while the client ladder was built (2026-10-07), and are the checks recorded as "Verified"
in `chat/ch03-client-ladder-log.md` on the client branches.

## What you need

| What | Why | Check |
|---|---|---|
| **Node.js 22.22 or newer** (24 was used) | runs the scripts and the stages (the client's `engines` field asks for 22.22) | `node -v` |
| **Git** | the runner makes a temporary worktree | `git --version` |
| **MongoDB** on `localhost:27017` | the stage-19 server needs a database. The checks use their own, `mernskeleton_ladder`, and add test users to it; drop it whenever you like. | `mongosh --eval "db.version()"` |
| **Microsoft Edge or Google Chrome**, installed normally | Playwright drives it; nothing is downloaded | open it once |
| **Internet, or a filled npm cache** | `npm ci` for the server and the client inside the worktree | |
| **Free ports** 3210–3213, 4210–4212, 5210 | test servers; your usual 3000 / 5173 are never used | |
| the **ladder branches**, local or as `origin/…` | what is being checked | `git branch -a --list "*ch03-client*"` |

Once, in `tools/`:

```bash
cd tools
npm install        # @babel/parser (for make-nc-ladder.mjs) and playwright-core
```

## Running

From anywhere in the repository. Your working folder and current branch are not touched.

```bash
node tools/ladder-e2e/run.mjs                      # all client stages + production builds + test suites
node tools/ladder-e2e/run.mjs --stages 05          # one stage
node tools/ladder-e2e/run.mjs --stages 01-04,09    # some stages
node tools/ladder-e2e/run.mjs --series teach-nc    # the comment-free copy
node tools/ladder-e2e/run.mjs --no-suites          # skip npm test at the end
node tools/ladder-e2e/run.mjs --keep               # leave the worktree, to look around afterwards
```

A full run takes about ten minutes, most of it `npm ci` and building 16 stages. The last lines are a summary:
one `PASS`/`FAIL` per stage, `production`, `server: node --test` and `client: vitest`.
Screenshots of failures and the build outputs go to `%TEMP%\ladder-e2e` (`$TMPDIR/ladder-e2e`).

Ctrl+C stops the test server and removes the worktree. If a run was killed harder than that, `git worktree list`
shows a leftover `ladder-e2e-wt-…` entry: remove it with `git worktree remove --force <path>`, or delete the folder
and run `git worktree prune`. A test server still running would hold port 3210; stop that `node server.js`.

Two things learned the hard way, already handled by the scripts:

- **Short Windows paths.** Node may report the temp folder as `C:\Users\ABCDEF~1\…` (an 8.3 short name). A Vite
  dev server started there answers 404 for `/@vite/client` as soon as it pre-bundles dependencies (stage 05, MUI),
  and the page stays blank. `config.mjs` therefore always uses the long real path of the temp folder.
- **The first page load is slow** in a fresh install, while Vite pre-bundles the dependencies. `check-stage.mjs`
  opens the page once and waits up to two minutes for React to render before the scenario starts.

Failed requests are listed after each stage with status, method and URL (`404 GET /@vite/client`). The ones a
scenario causes on purpose (400 on a bad signup, 401, 403, a blocked request) are expected.

| Environment variable | Default | Use |
|---|---|---|
| `LADDER_BROWSER` | `msedge` | `chrome`, `chromium` (after `npx playwright-core install chromium`), or a path to a browser `.exe` |
| `LADDER_HEADED` | (unset) | `1` shows the browser window, to watch a scenario |
| `LADDER_MONGODB_URI` | `mongodb://localhost:27017/mernskeleton_ladder?directConnection=true` | another database or host |
| `LADDER_API_PORT` | `3210` | the test server; production checks also use the next three ports |
| `LADDER_VITE_PORT` | `5210` | the stage's Vite dev server |
| `LADDER_OUT` | `<temp>/ladder-e2e` | where builds and screenshots go |

PowerShell sets them like `$env:LADDER_HEADED='1'; node tools/ladder-e2e/run.mjs --stages 10`.

## The files

| File | Does |
|---|---|
| `run.mjs` | the runner: a worktree in the temp folder, `npm ci`, the stage-19 server on 3210, then every stage, then the suites, then cleanup |
| `check-stage.mjs` | one stage: `vite build`, then the stage's own `vite.config.js` on 5210 (with `/api` sent to 3210), then scenario `sNN` in the browser. Fails on a failed step, an uncaught page error or a React warning in the console. |
| `check-production.mjs` | stage 15 and later: `vite preview`; Express serving the build (`CLIENT_DIST`); a build with `VITE_API_URL` on another origin with and without `CORS_ORIGIN` |
| `scenarios.mjs` | the browser scenarios `s01` … `s16`, plus small helpers (`fillSignup`, `fillSignin`, `api`) |
| `config.mjs` | ports, database, browser, starting a server |

Each scenario checks what its lesson adds. For example `s08` signs in and checks that cookie `t` is `httpOnly` and
invisible to `document.cookie`, `s10` plants an expired and a forged token, and `s11` opens someone else's edit
page and expects the server's 403. Some scenarios re-run earlier ones (`s13` runs `s10`, `s16` runs `s13` and
`s14`), so a later stage cannot quietly break an earlier feature.

**A new or changed stage** needs a matching `sNN` in `scenarios.mjs`. A scenario gets `{ page, base, see, notSee, step, email }`:
`page` is Playwright's page, `base` the stage's URL, and `email` a fresh address for this run.

---

## Unit, integration and end-to-end tests

| Kind | Checks | Here | Speed | When it fails, you know… |
|---|---|---|---|---|
| **Unit** | one function or component, alone, with everything around it faked | `server/tests/1-…` to `3-…`; `client/src/test/1-…` to `4-…` (the client's 3 and 4 render components: "component tests") | milliseconds | exactly which function is wrong |
| **Integration** | several real parts together (e.g. the whole Express app over HTTP, no database) | `server/tests/4-api.test.js` | fast | which request misbehaves |
| **End-to-end (e2e)** | the real app as a user sees it: browser, Vite, Express, MongoDB, cookies | these scripts | seconds per scenario | *that* a user-visible behaviour broke, not yet where |

Both kinds matter, for different reasons:

- **Unit tests** are cheap and precise, so there can be many. They pin down rules ("an expired token means signed
  out") and run on every save. But they fake the world around the code, so they cannot see that two correct parts
  do not fit together.
- **E2E tests** catch exactly that: a proxy that answers 502 instead of failing, a cookie the browser does not send,
  a redirect that loops, a page that only breaks after the production build. These problems all happened or were
  checked while building this ladder. E2E tests are slower and break more easily, so you keep fewer of them, for
  the paths that matter most. This is the usual "test pyramid": many unit tests, some integration tests, a few e2e tests.

For a teaching ladder, e2e has one more use: after a rebase rewrites 16 stages, it proves that every stage *still
does what its lesson says*. Unit tests only exist from stage 16 on.

## Why these packages

| Package | Why it was chosen |
|---|---|
| **playwright-core** | Playwright's library without the bundled browsers: it drives the Edge or Chrome that is already installed, so nothing large is downloaded. It waits for elements by itself (fewer flaky timeouts). It finds elements the way users do (`getByRole`, `getByLabel`). It can fake a dead server (`page.route(...).abort()`), read httpOnly cookies, watch requests (the Bearer header, the PATCH body), and use a fresh browser context per check. |
| **Vite's JavaScript API** (`build`, `createServer`, `preview`) | Each stage is built and served with *its own* `vite.config.js` and its own Vite version. The script only overrides the port and the proxy target. |
| **Plain Node scripts** instead of a test runner | Every stage runs in its own process, one after another, against one shared server; the output reads like the lesson. `@playwright/test` (see below) would be the step up. |
| **node:test** (server, in the repo) | Built into Node: no dependency at all, which suits the server lessons. |
| **Vitest + Testing Library + jsdom** (client, in the repo) | Vitest reuses the Vite config, so tests import `.jsx` and images exactly like the app. Testing Library queries like a user. jsdom gives a fake browser in Node, so these tests need no real browser. |

## Alternatives (briefly)

**End-to-end**

| Tool | Pros | Cons |
|---|---|---|
| **@playwright/test** (Playwright's own runner) | parallel runs, retries, HTML report, trace viewer with a timeline of every step, codegen that records clicks | one more config file; best when tests are written as test files rather than per-stage scripts |
| **Cypress** | very friendly interactive runner, time-travel debugging, big community, good for teaching | runs inside the browser: JavaScript only, one tab, cross-origin flows need `cy.origin`; WebKit support is experimental |
| **Puppeteer** | Google's library for Chrome (Firefox too), simple, close to the DevTools protocol | lower level: fewer test-oriented helpers; no runner of its own |
| **Selenium / WebDriver**, **WebdriverIO** | the W3C standard, every language and browser, real-device clouds | more setup (drivers), historically slower and flakier |

**Unit and component**

| Tool | Pros | Cons |
|---|---|---|
| **Jest** | the long-time default, huge ecosystem, snapshots | ESM and Vite projects need extra configuration; Vitest offers the same API with less setup |
| **Mocha + Chai** | flexible, mature | you assemble the pieces (assertions, mocks, coverage) yourself |
| **Vitest browser mode** | component tests in a real browser instead of jsdom | newer; needs a browser provider (e.g. Playwright) |
| **happy-dom** (instead of jsdom) | faster | less complete than jsdom |
| **Supertest** (server) | HTTP assertions on an Express app without opening a port | one more dependency; the server tests use `app.listen(0)` + `fetch` instead, which needs nothing |

## Later: a lesson on testing

These scripts are kept apart from the lessons on purpose. A future testing lesson for students could start from
the committed suites (server lesson 19, client lesson 16), then add a few e2e tests with `@playwright/test` for
the sign-in flow. This folder can serve as a source of scenarios for that.
