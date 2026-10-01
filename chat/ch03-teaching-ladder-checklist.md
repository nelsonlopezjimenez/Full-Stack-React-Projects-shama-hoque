# Chapter 03 (and 04) — teaching ladder, server

**Log:** [ch03-teaching-ladder-log.md](ch03-teaching-ladder-log.md)
**Target:** the server of `refactor/ch03-migration`, plus the intended differences listed under
"Final check" below.

## Goal

Rebuild the MERN skeleton server **from an empty folder**, one idea at a time, for beginners.
Every stage is a branch that starts from the previous stage, so

```bash
git diff teach/ch03-server-03-mongodb teach/ch03-server-04-read-one -- "Chapter03 and 04/mern-skeleton/server"
```

shows exactly one lesson, written as **additions**. A student can also check out any stage and run it.

This replaces the "going backwards" branch `refactor/ch03-simple-auth` (built by removing features
from the finished migration). That branch is kept, with its work saved in commit `3265c61`; its ideas
(plain-text password, a cookie that holds the user id) are stages 09–10 here.

## Decisions (2026-10-01)

| # | Decision | Choice |
|---|---|---|
| D1 | Where does the final server read the JWT? | **Cookie first, then the `Authorization: Bearer` header.** The migration only read the header and set the cookie without using it. The fallback keeps the migration's React client working until the client series. |
| D2 | Stage 02, users in a plain array (no database) | **Keep.** HTTP and JSON first, MongoDB second. |
| D3 | Stage 12, signed cookie before JWT | **Keep.** Small step that introduces secrets and signatures. |
| D4 | The book's code in `mern-skeleton/` | **Removed in the first commit of stage 01.** It stays on `main` (and in history) until the ladder is merged. |
| D5 | Client | **Not part of this series.** A later client series starts from the last server stage (`teach/ch03-client-01-…`) and ends with the client of `refactor/ch03-migration`. Only the end of the client series is merged into `main`. |
| D6 | CORS and serving a built client | Stage 18, the last stage before the tests. They are server code, needed by the client series. |
| D7 | Lesson notes | One file per stage, `server/lessons/NN-name.md`. They add up stage by stage, so the final version has the whole course. |

## Conventions

- Branch per stage: `teach/ch03-server-NN-name`. It points at the **last** commit of the stage.
  Most stages are one commit; stages 07 and 09 have several, one per sub-step.
- Every commit runs (`npm run dev`) and has `[BEGINNER]` / `[ADVANCED]` comments.
- `api.http` (VS Code REST Client) grows each stage with the requests for the new routes.
- Each stage gets a log entry (changed / why / verified / surprises).
- Code comments are written for the stage they appear in. When a later stage changes the code, it
  also updates the comments, so no comment ever talks about code that is not there yet.

## Stages

### Part A — everything in `server.js`

| # | Branch | Content | Packages |
|---|---|---|---|
| 01 | `…-01-hello` | Empty folder → `package.json` (`"type": "module"`, `dev` with `node --watch`), `GET /` answers text, `app.listen`. First `api.http`. | express |
| 02 | `…-02-memory-users` | `express.json()`, an array as "database": `POST /api/users` (201), `GET /api/users`. Restart → users gone. | |
| 03 | `…-03-mongodb` | Mongoose: connect with top-level `await`, schema in `server.js` (`required`, `trim`, `match`, `unique` + `User.init()`), the two routes rewritten with `async`/`await`. Invalid input → an ugly 500 (fixed in 08). | mongoose |
| 04 | `…-04-read-one` | `GET /api/users/:userId`: route params, `findById`, 404. | |
| 05 | `…-05-delete` | `DELETE /api/users/:userId`. Same URL, another verb: REST. | |
| 06 | `…-06-update` | `PATCH /api/users/:userId`: PATCH vs PUT, `updated`, `save()` runs validators. Naive `Object.assign(user, req.body)` (fixed in 15). `server.js` is now ~150 lines with the lookup + 404 repeated three times. | |

### Part B — split into files (why: one job per file, small diffs, reuse, testability)

| # | Branch | Commits |
|---|---|---|
| 07 | `…-07-split` | **a** `config/config.js` + `.env` / `.env.example` (`--env-file-if-exists`) · **b** `models/user.model.js` · **c** `controllers/user.controller.js` · **d** `routes/user.routes.js` (`express.Router`, `router.route`) · **e** `express.js` builds the app, `server.js` starts it · **f** `userByID` middleware removes the repeated lookup (`next()`, middleware chains). |

### Part C — errors

| # | Branch | Content |
|---|---|---|
| 08 | `…-08-errors` | First the problems (HTML 500 with a stack trace for a duplicate email, CastError for a bad id, HTML 404 for unknown routes). Then: JSON 404 for `/api`, central error handler (4 parameters, Express 5 forwards rejected Promises), `helpers/dbErrorHandler.js`, CastError → 400, 500 hides details, `app.listen` error callback. |

### Part D — authentication and authorization

| # | Branch | Content | Packages |
|---|---|---|---|
| 09 | `…-09-password-plain` | **a** `password` field (plain text, `minlength`); `GET /api/users/:id` now leaks it · **b** `toJSON` hides it · **c** `routes/auth.routes.js` + `controllers/auth.controller.js`: `POST /api/auth/sessions` compares with `===`, 400 / 401 with one message for both failures. | |
| 10 | `…-10-cookie-session` | Sign-in sets cookie `userId`, `DELETE /api/auth/sessions` clears it, `requireSignin` (401) protects read/update/delete, and runs before `userByID`. Demo: edit the cookie → you are someone else. | cookie-parser |
| 11 | `…-11-authorization` | `hasAuthorization` (403) on update/delete. 401 vs 403. | |
| 12 | `…-12-signed-cookie` | `cookieParser(secret)` + `signed: true`, `COOKIE_SECRET`. The demo from 10 now fails. | |
| 13 | `…-13-jwt-cookie` | `jsonwebtoken` signs, `express-jwt` verifies (cookie `t` first, then Bearer header, D1). Expiry, `httpOnly` / `sameSite` / `secure`, `UnauthorizedError` → 401. Demo: decode a token at jwt.io. | jsonwebtoken, express-jwt |
| 14 | `…-14-password-hashed` | Stolen-database story, hashing vs encryption, salt, `scrypt`, `timingSafeEqual`, `password` virtual, `authenticate()`. Old plain-text users must be deleted. | |

### Part E — hardening and production

| # | Branch | Content | Packages |
|---|---|---|---|
| 15 | `…-15-mass-assignment` | `PATCH {"salt": …, "created": …}` was accepted → allow-list of updatable fields. | |
| 16 | `…-16-helmet` | `helmet()` (headers before/after), `compression`, `express.urlencoded`. | helmet, compression |
| 17 | `…-17-logging` | `helpers/logger.js` (`debug` only in development), request logger with timing, production refuses to start without `JWT_SECRET`. | |
| 18 | `…-18-client-ready` | CORS allow-list (`CORS_ORIGIN`), `CLIENT_DIST` static files + SPA fallback (`/{*splat}`). | cors |
| 19 | `…-19-tests` | `node:test` in four levels (pure function → config → middleware → HTTP), plus a test that the cookie is read. Final README. | |

## Final check

After stage 19:

```bash
git diff refactor/ch03-migration teach/ch03-server-19-tests --stat -- "Chapter03 and 04/mern-skeleton/server"
```

may show **only** these intended differences:

- `controllers/auth.controller.js` — `getToken`: cookie first, then Bearer header (D1), and comments.
- `api.http` — uses the cookie that REST Client remembers; one request shows the Bearer header.
- `tests/4-api.test.js` — one more test: the token is read from the cookie.
- `README.md` — a "Lessons" section.
- `lessons/` — new.

**Result (2026-10-01):** with comments and blank lines removed, the code is identical to the
migration except:

| File | Difference | Why |
|---|---|---|
| `controllers/auth.controller.js` | `getToken` (cookie `t`, then Bearer) passed to `expressjwt` | D1 |
| `tests/4-api.test.js` | +1 test: an expired token **in the cookie** → 401 "jwt expired" (fails on the migration, passes here) | D1 |
| `config/config.js` | default database `mernskeleton` instead of `mernproject` (the Chapter 5 database) | found in 07a |
| `.env.example` | a comment with a command that makes a random secret | lesson 12 |

`server.js`, `express.js`, both routes, the model, both helpers, the user controller, tests 1–3,
`package.json`, `package-lock.json` and `.gitignore` match exactly (the lock file built stage by stage is
byte-for-byte the migration's). Comments differ where the ladder explains things in its own order;
`README.md` and `api.http` are the ladder's own (README = migration README + "Sign-in token" + "Lessons").

## Fixing an earlier stage later

Commit the fix on the stage where it belongs, then replay every later stage on top of it, from the last
branch:

```bash
git switch teach/ch03-server-19-tests
git rebase --update-refs teach/ch03-server-05-delete   # example: the fix was committed on stage 05
```

`--update-refs` moves every `teach/ch03-server-*` branch in between. Fixes should not touch the log
file, so the replay does not conflict with later log entries.

When the course is frozen, tag each stage (`ch03-server-step-NN`).

## Later / ideas

| ID | Idea |
|---|---|
| L1 | Rate limiting on sign-in (migration checklist 6.9). |
| L2 | `lowercase: true` on email. |
| L3 | Require sign-in for `GET /api/users` (the list is public, see the comment in `routes/user.routes.js`). |
