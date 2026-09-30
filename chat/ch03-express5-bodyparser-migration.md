# Chapter 03 — Migrating the Express server from v4 to v5 (bodyParser and related breaking changes)

**Date:** 2026-09-29
**Project:** `Chapter03 and 04/mern-skeleton/server`
**Assumption:** the client-side code (React, Material-UI, server-side rendering) has been deleted, so only the API server is left.

---

## The question

> In chapter 03 on the express side if installing v5 what lines would change: bodyParser assuming that client side code is deleted

## Short answer

| File | Line(s) | Change |
|---|---|---|
| `server/express.js` | 3 | Delete `import bodyParser from 'body-parser'` |
| `server/express.js` | 34 | `bodyParser.json()` → `express.json()` |
| `server/express.js` | 35 | `bodyParser.urlencoded({ extended: true })` → `express.urlencoded({ extended: true })` |
| `package.json` | dependencies | Remove `body-parser`, change `express` to `^5.x` |
| `package.json` | engines | Change `node` from `8.11.1` to `>=18` |

```js
// server/express.js — before (Express 4)
import bodyParser from 'body-parser'
...
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))

// server/express.js — after (Express 5)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
```

---

## Why these lines change

### 1. Express ships its own body parsers

Since Express 4.16, `express.json()` and `express.urlencoded()` have been built in. They wrap the `body-parser` package internally. Express 5 depends on `body-parser` 2.x itself, so a separate `body-parser` dependency is redundant.

Keeping `body-parser` 1.x next to Express 5 would mostly still work, but it causes two problems:
- The project would have two different major versions of the same parser in `node_modules`.
- The code would follow the pattern that older tutorials use, not the one current Express docs show.

### 2. The `extended` default flipped to `false`

In `body-parser` 2.x (used by Express 5), `urlencoded()` defaults to `extended: false`.

| `extended` | Parser | `a[b]=1&a[c]=2` becomes |
|---|---|---|
| `true` | `qs` library | `{ a: { b: '1', c: '2' } }` |
| `false` | Node `querystring` | `{ 'a[b]': '1', 'a[c]': '2' }` |

The original code already passes `{ extended: true }` explicitly, so keep that argument to preserve the old behavior. Dropping it while migrating would silently change how nested form data is parsed.

### 3. `req.body` is `undefined` when no parser runs

In Express 4, `req.body` was initialized to `{}`. In Express 5 it stays **`undefined`** unless a body parser actually parsed the request.

This project has code that is affected:
- `signin` in `auth.controller.js` reads `req.body.email`. If a client posts without `Content-Type: application/json`, the JSON parser skips the request and `req.body` is `undefined`. The result is `TypeError: Cannot read properties of undefined`, where v4 just gave `undefined`.
- `update` in `user.controller.js` does `_.extend(user, req.body)`. lodash treats `undefined` as a no-op, so this line is safe, but it is worth knowing why.

Defensive fix, if needed:
```js
const { email, password } = req.body ?? {}
```

### 4. Node version

Express 5 requires **Node 18 or newer**. The `engines` field in `package.json` still says `"node": "8.11.1"` and must be updated.

---

## Other Express 5 breaking changes that affect this server

These are not about bodyParser, but they break the same server once Express 5 is installed.

### A. String status codes throw

Express 5's `res.status()` accepts only **integers from 100 to 999**. Passing a string such as `'401'` throws a `TypeError` ("Invalid status code"). Express 4 accepted strings because Node converted them.

The original author used strings in five places:

| File | Line | Current | Fix |
|---|---|---|---|
| `server/controllers/auth.controller.js` | 12 | `res.status('401')` | `res.status(401)` |
| `server/controllers/auth.controller.js` | 17 | `res.status('401')` | `res.status(401)` |
| `server/controllers/auth.controller.js` | 40 | `res.status('200')` | `res.status(200)` |
| `server/controllers/auth.controller.js` | 53 | `res.status('403')` | `res.status(403)` |
| `server/controllers/user.controller.js` | 25 | `res.status('400')` | `res.status(400)` |

> Correction: the first answer in this chat said line 54 for the `'403'` status. The correct line is **53**.

**Why Express changed this:** Express wanted invalid codes to fail loudly during development. A typo such as `'4O1'` or a value such as `NaN` should throw, not produce a strange response in production.

### B. Wildcard route syntax (`'*'`)

Express 5 uses `path-to-regexp` v8, which no longer allows a bare `*`. A wildcard must have a name:
```js
app.get('*', ...)          // v4 — throws at startup in v5
app.get('/*splat', ...)    // v5 — matches any path except '/'
app.get('/{*splat}', ...)  // v5 — also matches '/'
```
In this project, the only wildcard route is the server-side rendering catch-all in `express.js` (lines 49–89). Deleting the client code removes that block, along with the React/Material-UI imports on lines 12–22 and `devBundle` on lines 24–31. So the wildcard problem goes away along with the client code.

**Why Express changed this:** the old syntax was ambiguous. `*`, `?` and `+` sometimes worked as regex operators and sometimes as literal characters, and that led to ReDoS vulnerabilities. The new syntax is stricter and is designed to be safe from regex backtracking.

### C. `res.status()` validation also applies to error handlers

The error handler in `express.js` (lines 92–96) uses `res.status(401)` with an integer, so the status call itself is fine. But it has an **existing bug that is not caused by v5**:

```js
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({"error" : err.name + ": " + err.message})
  }
  // any other error: no response and no next(err) -> the request hangs
})
```
Fix:
```js
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: err.name + ': ' + err.message })
  }
  next(err)
})
```

### D. A benefit: rejected promises reach the error handler

Express 5 passes rejected promises from `async` route handlers to `next(err)` automatically. The controllers in this chapter use Mongoose callbacks. If you convert them to `async`/`await`, Mongoose 7+ requires it because callbacks were removed. In Express 5 you can then simply `throw`, and the error handler above receives the error. Express 4 needed a wrapper or `try/catch` + `next(err)` for this.

---

## What stays the same

- `cookie-parser`, `compression`, `helmet` and `cors` are mounted with `app.use()` exactly as before.
- `express.static` on line 43 works as before.
- `router.route(...)` and `router.param('userId', ...)` in the route files work as before.
- `res.clearCookie("t")` in `signout` works as before. In v5, `clearCookie` ignores the `maxAge`/`expires` options, but this code passes no options.

## Related but separate upgrades (not caused by Express 5)

- **`express-jwt`**: newer major versions (v6+) rename `userProperty` to `requestProperty` and require an `algorithms: ['HS256']` option. Later versions also switch to a named export: `import { expressjwt } from 'express-jwt'`.
- **`mongoose`**: v7+ removed callbacks, so `User.findOne(query, cb)`, `user.save(cb)` and `user.remove(cb)` must become `await` calls, and `remove()` becomes `deleteOne()`.

---

## Migration checklist (server only)

- [ ] `package.json`: `express` → `^5.x`, remove `body-parser`, set `engines.node` to `>=18`
- [ ] `express.js`: delete line 3, replace lines 34–35 with `express.json()` / `express.urlencoded({ extended: true })`
- [ ] `express.js`: delete the client/server-side rendering code (lines 12–31 and 49–89)
- [ ] Controllers: change the five string status codes to integers
- [ ] Error handler: add `return` and `next(err)`
- [ ] Optional: protect against `req.body` being `undefined` in `signin`
