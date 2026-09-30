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
