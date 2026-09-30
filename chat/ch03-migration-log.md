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
