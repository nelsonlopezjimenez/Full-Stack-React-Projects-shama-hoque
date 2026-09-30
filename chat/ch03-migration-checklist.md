# Chapter 03 (and 04) — mern-skeleton migration checklist

**Created:** 2026-09-30
**Branch:** `refactor/ch03-migration` (not merged; the decision to merge is still open)
**Project:** `Chapter03 and 04/mern-skeleton`
**Log:** [ch03-migration-log.md](ch03-migration-log.md)
**Earlier analysis:** [ch03-express5-bodyparser-migration.md](ch03-express5-bodyparser-migration.md)
**Routing discussion reused from Ch05** (branch `refactor/separate-client-server`): `claude-based-routes-evaluation.md`, `Chapter05/mern-social/DECISIONS.md` §3–4, `Chapter05/mern-social/docs/rest-routes.md`

## How to use this file

**Decision** column values:

- `do` — done in this migration (the log has the commit)
- `later` — kept on the list, but not now
- `skip` — not needed

Each step (or a small group of related steps) is **one commit** on the branch.
To look at one step: `git show <commit>`. The log gives the commit for each step.

**Size:** S = a few lines · M = one or two files · L = many files, or a rewrite

### Comment convention used in the refactored code

| Tag | Audience | What it explains |
|---|---|---|
| `[BEGINNER]` | first time with this stack | what a line does and why it is written this way |
| `[ADVANCED]` | already comfortable with it | trade-offs, alternatives, production concerns, links to the routing discussion |

In JSX the tags are written as `{/* [BEGINNER] ... */}`. The comments are scattered through the code on purpose rather than put on every line.
To list them: `git grep -n "\[BEGINNER\]\|\[ADVANCED\]" -- "Chapter03 and 04"`.

> **Scope note:** the folder is called "Chapter03 **and 04**". In the book, Chapter 3 is the backend (Express, MongoDB, JWT) and Chapter 4 is the React frontend of the same skeleton.
> Phases 1–6 are the server work. Phase 7 is the client work.

### Target versions (latest on 2026-09-30)

| Layer | Before | After |
|---|---|---|
| Node | 8.11 | >= 22.9 (tested on 24.13) |
| Express | 4.16 | 5.2 |
| Mongoose | 5.0 | 9.x |
| express-jwt / jsonwebtoken | 5 / 8 | 8 / 9 |
| helmet | 3 | 8 |
| React | 16.3 | 19.3 |
| React Router | 4 | 8.x |
| UI kit | material-ui 1.0-beta | @mui/material 9.x |
| Build | webpack 4 + Babel 6 + nodemon | server: none (native ESM, `node --watch`) · client: Vite 8 |
| Tests | none | server: `node:test` (built in) · client: Vitest |

---

## Phase 0 — Preparation

| ID | Step | Why | Size | Depends | Decision |
|---|---|---|---|---|---|
| 0.1 | Work on a branch `refactor/ch03-migration` | The user decides later whether to merge | S | — | do |
| 0.2 | Record the baseline in the log: the current app does **not** install or run on modern Node (Node 8, Babel 6, webpack 4) | Gives a "before" reference point | S | — | do |
| 0.3 | Target layout: **split into `server/` + `client/`**, two independent packages with no root `package.json` (same as Ch02) | The server must not depend on the client, and the client must not depend on the server | S | — | do |

## Phase 1 — Split the repo (same pattern as Ch02)

| ID | Step | Why | Size | Depends | Decision |
|---|---|---|---|---|---|
| 1.1 | Create `mern-skeleton/server/` as its own package: move `server/*` and `config/` into it and give it its own `package.json` | Lets the server be migrated separately from the client | M | 0.3 | do |
| 1.2 | Move the old React code into `mern-skeleton/client/src/` without changing it (it is migrated later in Phase 7) | Keeps the old client code for reference in the history | S | 1.1 | do |
| 1.3 | Delete the old build files: `.babelrc`, `webpack.config.*.js`, `nodemon.json`, `template.js`, `server/devBundle.js`, the root `package.json` | These are replaced by native ESM, `node --watch` and Vite | S | 2.1, 3.3 | do |
| 1.4 | Add a `.gitignore` for each package (`node_modules`, `dist`, `.env`) | Housekeeping | S | 1.1 | do |

## Phase 2 — Server runtime and tooling

| ID | Step | Why | Size | Depends | Decision |
|---|---|---|---|---|---|
| 2.1 | Switch to native ESM: add `"type": "module"`, add `.js` to relative imports, remove Babel | Node 20+ runs ESM directly, so no build step is needed | M | 1.1 | do |
| 2.2 | Set `engines.node` to `>=22.9.0` and remove `engines.npm` | `--env-file-if-exists` and `import.meta.dirname` need 22.9+ (same as Ch02) | S | — | do |
| 2.3 | Replace `nodemon` with `node --watch` in the `dev` script, and make `start` a plain `node server.js` | Same approach as Ch02; one less dependency | S | 2.1 | do |
| 2.4 | Load settings from a `.env` file with `node --env-file-if-exists=.env`, and add `.env.example` | Keeps secrets and the Mongo URI out of the code | S | 2.3 | do |
| 2.5 | **Bug:** `server.js:9` uses `${mongoUri}`, which is not defined, so the DB error handler throws a `ReferenceError`. Change it to `config.mongoUri` | Existing bug, not caused by the migration | S | — | do |
| 2.6 | Environment-aware logger instead of `console.log` (same idea as commit a28fe85 in Ch05) | Consistent with Ch05 | S | — | do |

## Phase 3 — Express 4 → 5

| ID | Step | Why | Size | Depends | Decision |
|---|---|---|---|---|---|
| 3.1 | Upgrade `express` to `^5`, remove `body-parser`, use `express.json()` / `express.urlencoded({ extended: true })` | Built into Express. Keep `extended: true`, because Express 5 changed the default to `false` | S | 2.1 | do |
| 3.2 | Change the 5 string status codes to integers (`auth.controller.js` lines 12, 17, 40, 53; `user.controller.js` line 25) | Express 5 throws on `res.status('401')` | S | 3.1 | do |
| 3.3 | Remove server-side rendering from `express.js`: the React/MUI/JSS imports, `devBundle` and the `app.get('*')` block | Express 5 rejects a bare `*`, and SSR with MUI beta cannot be kept alive | M | 3.1 | do |
| 3.4 | *Optionally* serve a built client (`CLIENT_DIST` env var) + SPA fallback with `app.get('/{*splat}')`. With no `CLIENT_DIST`, the server is API-only | Replaces what SSR did, without making the server depend on the client | S | 3.3 | do |
| 3.5 | Error handler: add `return` and `next(err)` for errors that are not 401 | Existing bug: any other error leaves the request hanging | S | — | do |
| 3.6 | Guard against `req.body` being `undefined` in `signin` (`req.body ?? {}`) | In Express 5, `req.body` is `undefined` when no parser ran | S | 3.1 | do |
| 3.7 | Add a JSON 404 handler for unknown `/api` routes | Gives a nicer API response | S | 3.5 | do |
| 3.8 | **(new)** REST routes, as in the Ch05 discussion: `POST/DELETE /api/auth/sessions` instead of `POST /auth/signin` + `GET /auth/signout`; `PATCH /api/users/:userId` instead of `PUT` | Signout was a GET with a side effect; the prefix was inconsistent; the update is partial | S | 3.1 | do |
| 3.9 | **(new)** Central error handling: `async` controllers without `try/catch`; Express 5 forwards rejected promises to the error handler, which maps them to status codes | The main benefit of Express 5; removes repeated code | M | 5.x | do |
| 3.10 | **(new, found during the migration)** Load the user with explicit route middleware *after* `requireSignin` instead of `router.param` | Measured: `router.param` runs **before** `requireSignin`, so requests without a token hit the DB and got 404 vs 401 (leaks which ids exist). The Ch05 notes state the order the other way round | S | 3.9 | do |

## Phase 4 — Middleware dependencies

| ID | Step | Why | Size | Depends | Decision |
|---|---|---|---|---|---|
| 4.1 | Upgrade `helmet` from 3 to 8 | v3 is years old. The defaults changed (CSP is now on by default), which is fine for an API and a Vite build | S | 2.1 | do |
| 4.2 | `cors`: only turned on when `CORS_ORIGIN` is set (the client is deployed on another origin); the Vite proxy covers development | `cors()` with no options allows any origin | S | — | do |
| 4.3 | Upgrade `cookie-parser` and `compression` to their latest versions | Routine update | S | — | do |
| 4.4 | Replace `_.extend` with `Object.assign` and remove `lodash` | Uses one lodash function | S | — | do |

## Phase 5 — Mongoose 5 → 9

| ID | Step | Why | Size | Depends | Decision |
|---|---|---|---|---|---|
| 5.1 | Upgrade `mongoose` to 9. Remove `mongoose.Promise = global.Promise`, and `await mongoose.connect()` before `app.listen()` | The server should only listen once the DB is connected | S | 2.1 | do |
| 5.2 | `user.controller.js`: change `create` and `list` to `async`/`await` | Mongoose 7+ removed callbacks | S | 5.1 | do |
| 5.3 | `user.controller.js`: change `userByID` to `async` (param middleware) | Same reason | S | 5.1 | do |
| 5.4 | `user.controller.js`: change `update` and `remove` to async; `user.remove()` → `user.deleteOne()` | `remove()` no longer exists | S | 5.1 | do |
| 5.5 | `auth.controller.js`: change `signin` to async | Same reason | S | 5.1 | do |
| 5.6 | **Bug:** `dbErrorHandler.getUniqueErrorMessage` looks for `.$` in the message, but MongoDB 4.2+ reports `index: email_1 dup key`, so users get a garbled message. Use `err.keyValue` instead | Existing bug that shows up once MongoDB is modern | S | 5.1 | do |
| 5.7 | `unique: 'Email already exists'` → `unique: true`. It is an index option, not a validator, so the message text is never used | Avoids confusion when teaching | S | 5.6 | do |

## Phase 6 — Authentication (JWT, cookies, passwords)

| ID | Step | Why | Size | Depends | Decision |
|---|---|---|---|---|---|
| 6.1 | Upgrade `jsonwebtoken` from 8 to 9 | Security fixes | S | — | do |
| 6.2 | Upgrade `express-jwt` from 5 to 8: `import { expressjwt }`, `algorithms: ['HS256']`, `userProperty` → `requestProperty: 'auth'` | Breaking API changes | S | 6.1 | do |
| 6.3 | **Bug:** the cookie option `expire: new Date() + 9999` is not a real option (and it builds a string). Use `maxAge`, `httpOnly`, `sameSite`, `secure` in production | Same bug as the one fixed in Ch05 (commit 1ea7967) | S | — | do |
| 6.4 | Add `expiresIn` to the JWT | Tokens currently never expire | S | 6.1 | do |
| 6.5 | In production, refuse to start when `JWT_SECRET` is missing (no `"YOUR_secret_key"` fallback) | Prevents a known secret from being used by accident | S | 2.4 | do |
| 6.6 | Password hashing: HMAC-SHA1 + a `Math.random` salt → `crypto.scrypt` with a `randomBytes` salt + `timingSafeEqual` | Weak hashing. Existing users would have to reset their passwords | M | 5.1 | do |
| 6.7 | `hasAuthorization`: `req.profile._id == req.auth._id` → `req.profile._id.equals(req.auth._id)` | Makes the ObjectId comparison explicit instead of relying on `==` | S | — | do |
| 6.8 | Hide `hashed_password`/`salt` with a schema `toJSON` transform instead of setting them to `undefined` by hand | One place instead of three | S | 5.1 | do |
| 6.9 | **(new)** Rate-limit `POST /api/auth/sessions` (e.g. `express-rate-limit`) | Brute-force protection | S | 3.8 | later |

## Phase 7 — Client (Chapter 4): Vite + React 19 + MUI + React Router

| ID | Step | Why | Size | Depends | Decision |
|---|---|---|---|---|---|
| 7.1 | Set up Vite + React in `client/` (same as Ch02); `index.html` replaces `template.js`; remove `react-hot-loader` | Replaces webpack 4, Babel 6 and HMR | M | 1.2 | do |
| 7.2 | Vite dev proxy for `/api` → `:3000` (only `/api` is needed once step 3.8 is done) | Same origin in development, so no CORS is needed | S | 7.1 | do |
| 7.3 | React Router 4 → 8: `Switch` → `Routes`, `component=` → `element=`, `Redirect` → `Navigate`, `PrivateRoute` as a layout route with `<Outlet/>`, `withRouter`/`match` → hooks | The v4 API no longer exists | M | 7.1 | do |
| 7.4 | `material-ui@1-beta` → `@mui/material` 9 + `@mui/icons-material` + emotion; `withStyles` → `sx` | The beta package cannot be installed with React 19 | L | 7.1 | do |
| 7.5 | Class components → function components + hooks | React 19 still supports classes, but hooks are the modern pattern | L | 7.3 | do |
| 7.6 | Remove the JSS server-side CSS cleanup in `MainRouter.componentDidMount` | No SSR any more | S | 3.3 | do |
| 7.7 | API layer: `async`/`await`, one shared `request()` helper, no `typeof window` SSR checks, signout that fits the httpOnly cookie | Removes repeated `fetch` code | S | 7.1 | do |
| 7.8 | Import `seashell.jpg` through Vite instead of `file-loader` | Asset handling | S | 7.1 | do |
| 7.9 | Hook up the production build: the server serves `client/dist` only when `CLIENT_DIST` is set (see 3.4) | Deployment in one process stays possible | S | 3.4, 7.1 | do |
| 7.10 | **(new)** Client URLs `/users/:userId` and `/users/:userId/edit` (plural, like the API) + a "not found" page | Consistent with the REST naming used on the server | S | 7.3 | do |
| 7.11 | **(new)** React 19 form actions (`useActionState`) in Signin/Signup; EditProfile keeps controlled inputs so both patterns can be compared | Modern React 19 pattern | S | 7.5 | do |
| 7.12 | **(new)** `VITE_API_URL` so the client can be deployed on its own origin | Keeps the client independent of where the server runs | S | 7.7 | do |

## Phase 8 — Tests and verification

| ID | Step | Why | Size | Depends | Decision |
|---|---|---|---|---|---|
| 8.1 | Add an `api.http` smoke-test file: signup → signin → list → read → update → delete → signout | Manual check to run after each phase | S | — | do |
| 8.2 | Server tests with the built-in `node:test` + `fetch` (no extra dependencies, no database) | Protects against regressions | M | 5.x | do |
| 8.3 | Client tests (Vitest + Testing Library) | Same idea as the Ch05 levels 3–4 | M | 7.x | do |

## Phase 9 — Docs and wrap-up

| ID | Step | Why | Size | Depends | Decision |
|---|---|---|---|---|---|
| 9.1 | Update the README + write `server/README.md` + `client/README.md` with setup, env vars and scripts | The old README describes the webpack setup | S | — | do |
| 9.2 | Docker / `docker-compose` with MongoDB (same as Ch05 `DOCKER.md`) | The user wants to use the MongoDB that is already running for now | M | — | later |
| 9.3 | Final chat note summarizing the migration + update memory | Same practice as Ch02 | S | — | do |
| 9.4 | **(new)** `[BEGINNER]` / `[ADVANCED]` comments in the refactored code | So the migration can be redone step by step, for yourself and with students | M | — | do |
