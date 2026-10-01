# Stage 19 — Automated tests

**Branch:** `teach/ch03-server-19-tests`

## Goal

`npm test` checks the important behaviour in under a second, without a database. Every later change
can be checked the same way, so nobody has to click through `api.http` by hand again.

## New ideas

- **`node:test` and `node:assert`** are built into Node, so there is nothing to install. `npm test` runs
  every `*.test.js` file in `tests/`.
- **`describe` / `it`** group and name the checks, and **`assert.equal(actual, expected)`** fails the
  test with a clear message when they differ.
- **Four levels, from easiest to hardest:**

| File | Tests | Needs |
|---|---|---|
| `1-dbErrorHandler.test.js` | a **pure function**: input → output | nothing |
| `2-config.test.js` | code that reads **environment variables** | a fresh import per test |
| `3-hasAuthorization.test.js` | one **middleware** with fake `req`/`res` and a mock `next` | `mock.fn()` |
| `4-api.test.js` | the **whole app over HTTP**: status codes, cookies, headers | `app.listen(0)` + `fetch` |

- **Why `express.js` and `server.js` are separate (stage 07e).** The API test imports the app from
  `express.js` and starts it on a free port (`listen(0)`). It never connects to MongoDB: each request
  in that file is answered *before* any database query, by the 404 handler, `requireSignin`,
  the sign-in input check, or `express.json()`.
- **What each test protects.** Each test is a lesson from an earlier stage that must not break again:
  401 *before* the database lookup (stage 10), "jwt expired" (13), the cookie is read (13), sign-out is
  not a GET (10), helmet headers and no CORS by default (16, 18), malformed JSON → 400 (08),
  production without `JWT_SECRET` refuses to start (17).
- **`api.http` is still useful** for the full flow with a real database. The tests cover what can
  be checked without one.

## Try it

```bash
npm test
npm run test:watch        # re-runs on every save
```

Then break something on purpose, for example remove `return` in `hasAuthorization`'s `if`. Run the tests:
which one fails, and does its message tell you why?

## Exercise

Add a test to `4-api.test.js`: `PATCH /api/users/<anyId>` without a token answers 401. Which of the
existing tests is it most similar to?
