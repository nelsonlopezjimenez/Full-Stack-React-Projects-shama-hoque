# Chapter 03 (and 04) — mern-skeleton migration log

**Checklist:** [ch03-migration-checklist.md](ch03-migration-checklist.md)
**Branch:** `refactor/ch03-migration`

The newest entry goes at the bottom. There is one entry for each commit; a commit can cover a small group of checklist steps.

## Entry template

```
### <date> — <step IDs> <short title>
- **Changed:** files and what changed in them
- **Why:** one line
- **Verified:** how the step was checked (command, curl, test), and the result
- **Notes / surprises:** anything unexpected; follow-up steps that were added to the checklist
- **Commit:** <subject line> (look it up with `git log --oneline refactor/ch03-migration`)
```

---

<!-- entries start here -->

### 2026-09-30 — 0.1–0.3 Preparation
- **Changed:** created the branch `refactor/ch03-migration` from `main` (a28fe85). Filled in the Decision column of the checklist; added the new steps 3.8, 3.9, 6.9, 7.10–7.12 and 9.4; updated the target versions to the latest releases (Mongoose 9, React Router 8, MUI 9, Vitest 5 — newer than the Ch05 versions).
- **Why:** agree on the plan before touching code.
- **Verified:** baseline — `package.json` requires `node 8.11.1`, Babel 6 and webpack 4, and `material-ui@1.0.0-beta` has peer dependencies on React 16. `npm install` cannot produce a working build on Node 24.13 (the machine's Node), so there is no runnable "before" state. The behaviour to keep is the one described in the book: signup, signin, list users, view/edit/delete own profile, signout.
- **Notes / surprises:** MongoDB is already running locally on `localhost:27017` and is used as it is (no Docker, step 9.2 = later).
- **Commit:** `docs(ch03): migration checklist decisions and log baseline`

### 2026-09-30 — 1.1, 1.2, 1.4 Split into server/ and client/ (moves only)
- **Changed:** `config/` → `server/config/`; `client/*` → `client/src/*` (still the old React 16 code). Added `server/.gitignore` and `client/.gitignore`. No file contents changed.
- **Why:** each package gets its own folder before anything is upgraded, so later diffs show real changes and not moves.
- **Verified:** `git status` shows only renames (`R`), so `git log --follow` still works for every file.
- **Notes / surprises:** the old root `package.json`, webpack configs, `.babelrc`, `nodemon.json` and `template.js` stay for one more commit, so this step removes nothing.
- **Commit:** `refactor(ch03): move server and client into separate folders`

### 2026-09-30 — 1.3, 2.1–2.5, 3.3 Server as its own ESM package (old major versions kept)
- **Changed:** new `server/package.json` (`"type": "module"`, `node --watch`, `--env-file-if-exists=.env`, `engines.node >=22.9.0`) with the **same major versions as the book** (Express 4, Mongoose 5, express-jwt 5, helmet 3), each at its last release. `.js` added to every relative import. `server/.env.example`. `express.js`: removed SSR (React/MUI/JSS imports, `devBundle`, `app.get('*')`, `/dist` static). `server.js`: `${mongoUri}` → `${config.mongoUri}`. Deleted the root `package.json`/lock, `.babelrc`, `nodemon.json`, `template.js`, the three webpack configs and `server/devBundle.js`.
- **Why:** change the *tooling* first and the *libraries* later, one per commit, so every commit runs and each breaking change can be seen on its own.
- **Verified:** smoke test with curl on port 3100 against the local MongoDB (db `mernskeleton`): signup, signin (token + cookie), wrong password 401, list, read with/without token, update, delete, signout all behave like the book.
- **Notes / surprises:**
  - Port 3000 was already in use by another local server (the Ch02 app), so all the manual checks in this log use `PORT=3100`.
  - Express 4.21 already prints `express deprecated res.status("401"): use res.status(401)` — a warning of the Express 5 change in step 3.2.
  - Mongoose 5 prints driver deprecation warnings (`useNewUrlParser`, `useUnifiedTopology`, `ensureIndex`); they disappear with Mongoose 9.
  - **Existing bug found:** signing up twice with the same email *succeeded* on a fresh database. `unique: true` only creates an index, and Mongoose builds it in the background after connecting while the server already accepts requests. This is fixed in the Mongoose step (wait for the indexes before `listen`).
  - `GET /api/users/not-an-id` answers 400 "User not found" — the real problem is an invalid id (CastError). Handled in step 3.9.
- **Commit:** `refactor(ch03-server): native ESM package, node --watch, .env; remove webpack and SSR`

### 2026-09-30 — 3.1, 3.2, 3.5, 3.6, 3.7 Express 4 → 5
- **Changed:** `express` ^4.21 → ^5.2.1, `body-parser` removed. `express.js`: `express.json()` / `express.urlencoded({ extended: true })`, JSON 404 for unknown `/api/*`, error handler now `return`s and calls `next(err)`. Controllers: the five `res.status('4xx')` → integers. `signin`: `const { email, password } = req.body ?? {}` + 400 when either is missing.
- **Why:** the breaking changes of Express 5 that affect this server (see [ch03-express5-bodyparser-migration.md](ch03-express5-bodyparser-migration.md)).
- **Verified:**
  - *Before the code fix* (Express 5 installed, old code): the first wrong-password signin threw `TypeError: Invalid status code: "401". Status code must be an integer.` inside a Mongoose callback — an unhandled exception, so **the whole server process died** and every later request got no answer (`HTTP 000`). Good demo for students: run the old code on Express 5 first.
  - *After:* all smoke requests answer as before; signin with no body → 400 "Email and password are required"; `GET /api/nope` → 404 JSON instead of an HTML page.
- **Notes / surprises:** routes, `router.param`, `cookie-parser`, `cors`, `helmet` 3 all worked unchanged on Express 5.
- **Commit:** `refactor(ch03-server): Express 5 (built-in body parsing, integer status codes, error handler)`

### 2026-09-30 — 5.1–5.5 Mongoose 5 → 9 (callbacks → async/await)
- **Changed:** `mongoose` ^5.13 → ^9.10.3. `user.controller.js` and `signin`: every callback → `async`/`await` with `try/catch` (same responses as before); `user.remove()` → `user.deleteOne()`. `server.js`: top-level `await mongoose.connect()` + `await User.init()` **before** `app.listen()`, `process.exit(1)` when the DB is unreachable, `mongoose.Promise` line removed, `listen` callback exits on error (Express 5 passes the error). `.env.example`: `?directConnection=true`.
- **Why:** Mongoose 7+ removed callbacks. Waiting for the connection and the indexes fixes the duplicate-signup race found in the ESM step.
- **Verified:** smoke test — signup, the **second signup with the same email is now rejected (400)**, signin, list, read, update, delete, signout all OK.
- **Notes / surprises:**
  - Read the [Mongoose 9 migration guide](https://mongoosejs.com/docs/migrating_to_9.html): its breaking changes (no `next()` in pre hooks, update pipelines, `returnDocument`, Node 20.19+) do not touch this code.
  - **Connection problem on this machine:** Mongoose 9 (MongoDB driver 7) failed with `getaddrinfo ENOTFOUND mongodb`, while Mongoose 5 had worked. The local MongoDB is a replica set whose member calls itself `mongodb` (a container name). New drivers discover the set and then connect to that name. `?directConnection=true` (same as Ch02) makes the driver talk only to `localhost:27017`.
  - The duplicate-email error text is garbled: `"11000 duplicate key error collection: mernskeleton.users index: email already exists"` → this is bug 5.6, fixed in the next commit.
  - `GET /api/users/not-an-id` now answers "Could not retrieve user" (a CastError), still 400 → step 3.9.
- **Commit:** `refactor(ch03-server): Mongoose 9, async/await controllers, wait for DB before listen`

### 2026-09-30 — 5.6, 5.7 dbErrorHandler and schema cleanup
- **Changed:** `helpers/dbErrorHandler.js`: duplicate key → field name from `err.keyValue`; validation errors → **all** messages joined (the `for...in` loop kept only the last one); `'use strict'` removed (ES modules are always strict). `models/user.model.js`: `required: [true, 'msg']` form, `unique: true`, regex without the useless `\@` escape, messages end with a period; the password-length check moved from a hollow `hashed_password` validator to a `pre('validate')` hook (no `next`, as Mongoose 9 requires); the book's second "Password is required" check removed because the `required` rule already reports it.
- **Why:** the duplicate-email message was garbled on modern MongoDB (seen in the previous step); students only saw one validation problem at a time.
- **Verified:** duplicate signup → `"Email already exists"`; `{"name":"","email":"bad","password":"1"}` → `"Password must be at least 6 characters. Name is required. Please fill a valid email address."`; `{}` → `"Password is required. Email is required. Name is required."`; the rest of the smoke test unchanged.
- **Notes / surprises:** the same garbled-message bug is listed as "not yet fixed" in Ch05 `DECISIONS.md` §7 — this fix can be copied there.
- **Commit:** `fix(ch03-server): readable duplicate-key and validation messages; modern schema syntax`

### 2026-09-30 — 3.9 Central error handling (Express 5 async errors)
- **Changed:** `user.controller.js` and `signin`: the `try/catch` blocks from the previous step removed — errors now reach the error handler on their own. `userByID`: 404 when the user does not exist (was 400). `create` answers `201 Created`. `express.js`: one error handler that maps `UnauthorizedError` → 401, `ValidationError`/`11000` → 400 (via `dbErrorHandler`), `CastError` → 400 "Invalid _id: …", errors that carry a `status` (malformed JSON) → that status, everything else → 500 "Internal server error" (logged on the server, no stack sent).
- **Why:** Express 5 forwards rejected Promises from async handlers (including `router.param` callbacks) to `next(err)`, so each controller only has to handle the success path.
- **Verified:** smoke test: `GET /api/users/000000000000000000000000` → 404; `GET /api/users/not-an-id` → 400 `Invalid _id: not-an-id`; `POST /api/users` with `{bad json` → 400; `PUT` with `{"email":"bad"}` → 400 with the validation message; signup → 201. The rest unchanged.
- **Notes / surprises:** diff this commit against the previous one (`git diff HEAD~1 -- '*controller*'`) to show students "Express 4 style vs Express 5 style" side by side.
- **Commit:** `refactor(ch03-server): central error handler, async controllers without try/catch`

### 2026-09-30 — 3.8 REST routes (from the Ch05 routing discussion)
- **Changed:** `auth.routes.js`: `POST /auth/signin` + `GET /auth/signout` → `POST` / `DELETE /api/auth/sessions` (same as Ch05). `user.routes.js`: `PUT /api/users/:userId` → `PATCH`. Both route files now carry a route table and the reasoning in `[BEGINNER]`/`[ADVANCED]` comments.
- **Why:** from the Ch05 review — GET must not have side effects (sign out); one `/api` prefix for everything; the update is partial, so PATCH (`Chapter05/mern-social/docs/rest-routes.md` §2, §4, §5). The Ch05 remark that `GET /api/users` is public is recorded in a comment; the route stays public because the client's Users page is public.
- **Verified:** smoke test run with the new routes: all OK. The old URLs now answer 404 (`GET /auth/signout` → Express's default page, because it is outside `/api`; `PUT /api/users/:id` → JSON 404 from the `/api` handler).
- **Notes / surprises:**
  - This is the first commit that breaks the old client contract; the client is migrated in Phase 7 and uses the new URLs from the start.
  - Ch05 kept `PUT` for the user update; Ch03 now uses `PATCH`. Decide whether to align Ch05 later.
  - [ADVANCED] Strictly, a wrong method on an existing URL should be `405 Method Not Allowed` with an `Allow` header; a 404 is the common, simpler answer.
- **Commit:** `refactor(ch03-server): REST routes /api/auth/sessions and PATCH /api/users/:userId`

### 2026-09-30 — 6.1–6.5, 6.7, 6.8 JWT, cookie and config hardening
- **Changed:** `express-jwt` ^5 → ^8.5.1 (`import { expressjwt }`, `algorithms: ['HS256']`, `requestProperty: 'auth'`), `jsonwebtoken` ^8 → ^9.0.3. `signin`: token with `expiresIn` (default `1d`), cookie `httpOnly` + `sameSite: 'strict'` + `secure` in production + `maxAge`; the same 401 message for "unknown email" and "wrong password"; `signout` clears the cookie with the same options. `hasAuthorization`: `.equals()` instead of `==`. `config.js`: throws at startup when `NODE_ENV=production` and no `JWT_SECRET`; new `JWT_EXPIRES_IN` / `JWT_COOKIE_MAX_AGE_MS`; `??` instead of `||`; `port` as a number. `user.model.js`: `toJSON` transform removes `hashed_password`/`salt`; the three manual `= undefined` blocks removed from the controller.
- **Why:** the book's tokens never expired, the cookie option was ignored, the fallback secret is public on GitHub, and the password hash was only hidden where someone remembered to hide it.
- **Verified:** `Set-Cookie: t=…; Max-Age=86400; Path=/; Expires=…; HttpOnly; SameSite=Strict`. No response in the smoke test contains `hashed_password` or `salt` (grep count 0). With `JWT_EXPIRES_IN=1s`: the token works, then 2 s later → 401 `jwt expired`. A hand-made `alg: none` token → 401 `jwt signature is required`. `NODE_ENV=production` without `JWT_SECRET` → the server refuses to start.
- **Notes / surprises:**
  - **Existing security issue found:** `update` uses `_.extend(user, req.body)`, so a signed-in user can write *any* field of their own document (`hashed_password`, `salt`, `created`, ...). Fixed with an allow-list in step 4.4.
  - "Account enumeration" fix changes a visible message: signing in with an unknown email now says "Email and password don't match." instead of "User not found".
- **Commit:** `feat(ch03-server): express-jwt 8, token expiry, httpOnly cookie, toJSON hides password fields`

### 2026-09-30 — 6.6 Password hashing: HMAC-SHA1 → scrypt
- **Changed:** `user.model.js`: `encryptPassword` uses `crypto.scryptSync(password, salt, 64)`; `makeSalt` uses `crypto.randomBytes(16)`; `authenticate` compares with `crypto.timingSafeEqual` (and length check); method shorthand syntax; `import crypto from 'node:crypto'`.
- **Why:** SHA1/HMAC is a fast hash (easy to brute-force after a leak), and a salt built from `Date` × `Math.random()` is predictable.
- **Verified:** full smoke test passes (signup → signin → ... → delete). Direct model check: salt 32 hex chars, hash 128 hex chars, right password `true`, wrong password `false`, an old 40-char SHA1 hash → `false` (no crash thanks to the length check). One `scryptSync` call ≈ 22 ms on this machine.
- **Notes / surprises:** existing users from an old database cannot sign in after this change (they would need a password reset). The `mernskeleton` test database starts empty, so nothing is lost here.
- **Commit:** `feat(ch03-server): scrypt password hashing with random salt and timing-safe compare`

### 2026-09-30 — 4.1–4.4 helmet 8, CORS allow-list, lodash removed (mass-assignment fix)
- **Changed:** `helmet` ^3 → ^8.3.0 (same `app.use(helmet())`). `cors` only mounted when `CORS_ORIGIN` is set (comma-separated allow-list, `credentials: true`); `config.corsOrigins`. `update`: `_.extend(user, req.body)` → allow-list `['name', 'email', 'password']` + `Object.fromEntries` + `Object.assign`; `lodash` uninstalled. `cookie-parser`/`compression` were already at their latest versions since the ESM step (4.3). `.env.example`: commented `CORS_ORIGIN`.
- **Why:** helmet 3 is years old; `cors()` with no options allowed every origin; the mass-assignment issue found in the JWT step.
- **Verified:** smoke test status codes unchanged. `PATCH` with `{"name":"Mass2","hashed_password":"x","salt":"y","created":"2000-01-01"}` → only the name changed and the old password still signs in (200). `PATCH {"password":"newpass1"}` → the new password signs in (200). With `CORS_ORIGIN=http://localhost:4173`: that origin gets `Access-Control-Allow-Origin`; `http://evil.example` does not (the browser would block it). helmet 8 headers present (`Content-Security-Policy`, `Strict-Transport-Security`, no `X-Powered-By`).
- **Notes / surprises:** `npm outdated` is empty — every server dependency is now on its latest version.
- **Commit:** `refactor(ch03-server): helmet 8, opt-in CORS allow-list, allow-listed update without lodash`

### 2026-09-30 — 2.6, 3.4, 7.9 Logger and optional client serving
- **Changed:** new `helpers/logger.js` (`info`/`error` always, `debug` in development only) + a dev-only `requestLogger` middleware (method, URL, status, ms — no `morgan` needed). `server.js`, `express.js`, `signin` use the logger; `signin` prints the issued JWT in development. `config.clientDist` from `CLIENT_DIST` (resolved from the server folder with `import.meta.dirname`); when set, `express.js` serves it with `express.static` + SPA fallback `app.get('/{*splat}')`, skipping paths with a file extension.
- **Why:** consistent with Ch05 (commit a28fe85 / CLAUDE-GUIDE Strategy A). Serving the client is optional, so the server never depends on the client being there.
- **Verified:** dev log shows `POST /api/users → 201 (40.6 ms)` and `JWT issued for …`. With `CLIENT_DIST` pointing at a fake build: `/` and `/users/123` → index.html (200), `/assets/app.js` → the file, `/assets/missing.js` → 404, `/api/nope` → JSON 404. Starting on the busy port 3000 prints `listen EADDRINUSE: address already in use :::3000` and exits (Express 5 passes the error to the `listen` callback).
- **Notes / surprises:** none.
- **Commit:** `feat(ch03-server): dev logger, request logging, optional CLIENT_DIST serving with Express 5 wildcard`

### 2026-09-30 — 3.10 (new) userByID after requireSignin, instead of router.param
- **Changed:** `user.routes.js`: `router.param('userId', …)` removed; `userCtrl.userByID` listed in each `:userId` route right after `requireSignin`. `userByID` is now `(req, res, next)` and reads `req.params.userId`. Comments rewritten in both files.
- **Why:** a 10-line test app showed that Express runs a `router.param` callback **before** the route's own middleware: the order was `userByID → requireSignin → read`. The Ch05 notes (`docs/rest-routes.md` §2) say `requireSignin → userByID → read`, which is not what Express does.
- **Verified:** `GET /api/users/000000000000000000000000` **without** a token: before this commit → 404 "User not found" (a DB query ran, and the answer tells an anonymous caller whether the id exists); after → 401. With a token → 404 as before. The rest of the smoke test unchanged.
- **Notes / surprises:** added as checklist step 3.10. The same order applies to Ch05 (`userByID`, `postByID`), and its notes should be corrected there.
- **Commit:** `fix(ch03-server): run userByID after requireSignin (router.param ran first)`

### 2026-09-30 — 8.1, 8.2 Server tests (node:test) and api.http
- **Changed:** `server/tests/` with four levels (same progression idea as Ch05 `TEST.md`): `1-dbErrorHandler` (pure function), `2-config` (env vars + fresh ESM import via `?fresh=n`), `3-hasAuthorization` (middleware with fake `res` and `mock.fn()`), `4-api` (the whole app on `listen(0)` + built-in `fetch`). `npm test` = `node --test`, `npm run test:watch`. `server/api.http`: the full flow for the VS Code REST Client extension, with the token captured from the sign-in response.
- **Why:** protect the fixes from this migration. Built-in runner, so **no test dependencies** and **no database** needed (every API test is answered before a DB query).
- **Verified:** `npm test` → 18 tests, 4 suites, all pass in ~0.4 s. Test 4 "rejects a protected route without a token" depends on step 3.10: with `router.param`, the request would wait for a DB lookup (Mongoose buffers for 10 s without a connection) instead of answering 401.
- **Notes / surprises:** `api.http` uses port 3000 (the normal dev port); change `@baseUrl` if 3000 is busy, as it is on this machine.
- **Commit:** `test(ch03-server): node:test suite in four levels (no DB) and api.http smoke file`

### 2026-09-30 — 7.1, 7.2, 7.6, 7.7, 7.8, 7.12 + part of 7.3/7.4/7.5 Client: Vite, API layer, router shell
- **Changed:** new `client/package.json` (React 19.3, React Router 8.4, MUI 9.4 + emotion, `@fontsource/roboto`, Vite 8), `vite.config.js` (`/api` proxy to `API_PROXY_TARGET`, default `:3000`), `index.html` (replaces `template.js`), `.env.example`. React files renamed `.js` → `.jsx` with `git mv`. Ported: `main.jsx` (`createRoot` + `StrictMode`), `App.jsx` (`createTheme`, `CssBaseline`, no `react-hot-loader`), `MainRouter.jsx` (`Routes`/`element`, protected layout route, `path="*"` → new `core/NotFound.jsx`), `PrivateRoute.jsx` (layout route with `<Outlet/>`), `Menu.jsx` (`NavLink` + `&.active` instead of `isActive`, hooks instead of `withRouter`), `Home.jsx` (`sx`). API layer: new `core/request.js` (one `fetch` helper, `VITE_API_URL`, never throws, returns `{ error }`), `api-auth.js` (`/api/auth/sessions`), `api-user.js` (`PATCH`, plain `(userId, token)` arguments), `auth-helper.js` (no SSR checks, treats an expired JWT as signed out, no `document.cookie` hack).
- **Why:** the book's client needs webpack 4/Babel 6/React 16/material-ui beta and cannot be installed today.
- **Verified:** `vite build` OK (397 kB JS, 127 kB gzip). Headless Edge against the server with `CLIENT_DIST=../client/dist`: `/` renders menu + Home card; `/nope` renders "Page not found"; no console errors.
- **Notes / surprises:**
  - Still the old book code, not imported yet: `Signin`, `Signup`, `Users`, `Profile`, `EditProfile`, `DeleteUser` (next two commits). Vite only bundles imported files, so the build works in the meantime.
  - React Router 8 needs React ≥ 19.2.7 and Node ≥ 22.22 → `engines.node` of the client is `>=22.22.0`.
  - MUI 9 removed system props on `Typography` (`color="error"` etc.), so every style goes through `sx`.
  - On this machine the client's own `.env` sets `API_PROXY_TARGET=http://localhost:3100` (port 3000 is busy).
- **Commit:** `feat(ch03-client): Vite + React 19 + React Router 8 + MUI 9 shell, API layer, Home and Menu`

### 2026-09-30 — 7.11 + part of 7.3/7.4/7.5 Signin and Signup with React 19 form actions
- **Changed:** `Signin.jsx` and `Signup.jsx` rewritten as function components using `useActionState` + `<Card component="form" action={formAction}>`: no `useState` per field, no `onChange`, `isPending` disables the button, Enter submits (the book only had `onClick`). Signin goes back to `location.state.from` (set by `PrivateRoute`) with `replace: true`. The Signup dialog has no `onClose` instead of the removed `disableBackdropClick`. New `core/FormError.jsx` (SVG `ErrorIcon` + `role="alert"`, replaces the Material Icons font ligature). Routes `/signup` and `/signin` added to `MainRouter`.
- **Why:** the modern React 19 way to write forms; EditProfile (next commit) keeps controlled inputs so students can compare both.
- **Verified:** new end-to-end check with headless Edge driven over the DevTools protocol (a scratch script, Node built-ins only): empty signup shows all three server messages; signup opens the dialog; duplicate email → "Email already exists"; after an error, name/email stay filled (the action returns them and they become the new `defaultValue` when React resets the form); wrong password → error with email kept; correct password → home, menu shows My Profile/Sign out; unknown URL → Page not found. No React/MUI warnings in the console.
- **Notes / surprises:** MUI buttons are uppercased with CSS, so `innerText` returns "SUBMIT"; the check script reads `textContent` instead.
- **Commit:** `feat(ch03-client): Signin and Signup with React 19 useActionState form actions`

### 2026-09-30 — 7.3, 7.4, 7.5, 7.10 Users, Profile, EditProfile, DeleteUser
- **Changed:** the last four class components → function components with hooks. `Users`: `useEffect` + `AbortController`, `ListItemButton component={Link}` (MUI removed `<ListItem button>`), `key={item._id}` instead of the index, errors shown instead of `console.log`. `Profile`: `useParams`, effect depends on `[userId]` (replaces `componentWillReceiveProps`), aborts stale requests (fixes a race in the book), `secondaryAction` instead of `ListItemSecondaryAction`, renders nothing until the user is loaded (no "Invalid Date" flash), redirects to sign-in on 401. `EditProfile`: kept as **controlled inputs** on purpose (compare with the form actions in Signin/Signup), `onSubmit` + `preventDefault`, `navigate()` instead of a redirect flag. `DeleteUser`: `useState` for the dialog, error shown in the dialog, `propTypes` dropped (React 19 ignores them). `MainRouter`: `/users`, and `/users/:userId` + `/users/:userId/edit` inside the `PrivateRoute` layout route (the book only protected the edit page).
- **Why:** finishes the client migration.
- **Verified:** end-to-end run in headless Edge, 28 checks, all pass, no console errors/warnings: protected URL → /signin; signup errors, success and duplicate; signin errors and success; My Profile (NavLink `active` class set); unknown id → "User not found"; edit pre-filled, invalid email blocked by the browser, save → profile with the new name; users list → profile; sign out clears sessionStorage; visiting a profile while signed out → sign in → **back to that profile** (`state.from`); delete → confirm → home, signed out; the deleted account can no longer sign in; unknown URL → Page not found.
- **Notes / surprises:**
  - My first check expected a server error for `email = "bad"` in EditProfile, but `type="email"` makes the **browser** block the submit — correct behaviour; the check was changed.
  - `vite build` now warns that the bundle (510 kB) is over 500 kB → next commit (code splitting).
  - No imports of `material-ui`, `react-router-dom`, `withStyles` or `PropTypes` remain in `client/src`.
- **Commit:** `feat(ch03-client): Users, Profile, EditProfile, DeleteUser as function components with hooks`

### 2026-09-30 — 7.13 (new) Code splitting with React.lazy
- **Changed:** `MainRouter.jsx`: Signin, Signup, Users, Profile and EditProfile loaded with `lazy(() => import(...))`; `<Suspense fallback={<LinearProgress />}>` around `<Routes>`. Menu, Home, NotFound and PrivateRoute stay in the main bundle. Checklist row 7.13 added.
- **Why:** `vite build` warned "Some chunks are larger than 500 kB" (510 kB) after the last commit.
- **Verified:** main bundle 510 kB → 256 kB (81 kB gzip); each page is its own 1–10 kB chunk, and shared MUI parts (TextField, Modal, Button) are separate chunks. No warning. End-to-end run: 28/28 pass, no console errors.
- **Notes / surprises:** Rolldown (Vite 8's bundler) names shared chunks after one of the modules inside them, so a 131 kB chunk is called `request-*.js` even though it is mostly MUI code.
- **Commit:** `perf(ch03-client): lazy-load pages with React.lazy and Suspense`
