# Stage 08 — Error handling

**Branch:** `teach/ch03-server-08-errors`

## Goal

Every answer is JSON with an honest status code, even when something goes wrong.

## First, the problems (run them on stage 07 if you like)

| Request (`api.http`) | Before | What the client needed |
|---|---|---|
| 4. create with `{}` | 500 + HTML page with a stack trace | 400 "Email is required. Name is required." |
| 5. same email twice | 500 + HTML "E11000 duplicate key ..." | 400 "Email already exists" |
| 10. `/api/users/not-an-id` | 500 + HTML CastError | 400 "Invalid _id: not-an-id" |
| 16. `/api/nope` | 404 + HTML "Cannot GET" | 404 as JSON |
| 17. broken JSON | 400 + HTML page | 400 as JSON |

Three things are wrong with these answers:
- **HTML.** The React client calls `response.json()`, which fails on an HTML page.
- **500.** A 500 means the server is broken, but here the *client* sent bad data, which is a 400.
- **Stack traces** tell an attacker which libraries and files the server uses.

## New ideas

- **Status code families.** 2xx success · **4xx the client made a mistake** (400 bad data, 401 not
  signed in, 403 not allowed, 404 not found) · **5xx the server failed** (500).
- **Central error handler.** One function with **four** parameters `(err, req, res, next)`,
  registered **last** in `express.js`. Every error from every route ends up there.
- **Express 5 + `async`.** When an `await` in a handler throws (for example `save()` refuses bad data),
  Express 5 sends the error to the error handler by itself. So the controllers have no `try/catch`.
- **`helpers/dbErrorHandler.js`** turns MongoDB/Mongoose errors into readable sentences:
  error code `11000` → "Email already exists", and a `ValidationError` → all its messages.
- **Hide internals.** For a real 500 the server logs the details in the terminal and the client only gets
  "Internal server error".
- **A JSON 404 for `/api`.** A small middleware after the routes catches every `/api/...` that no
  route matched.
- **Startup errors.** `app.listen` now reports a busy port (`EADDRINUSE`) and stops.

## What changed

| File | What |
|---|---|
| `express.js` | `/api` 404 handler and the central error handler |
| `helpers/dbErrorHandler.js` | new: readable database errors |
| `controllers/user.controller.js` | comments only: why there is no try/catch, where CastError goes |
| `server.js` | `app.listen` checks for an error |
| `api.http` | 4, 5, 10, 15 now expect 400; new 16 and 17 |

## Try it

1. Send 4, 5, 10, 15, 16, 17 and compare with the table above. Every answer is now `{ "error": "..." }`.
2. Start a second `npm run dev` in another terminal: it says the port is in use and stops.

## Exercise

In the error handler, add a branch that answers `413` with `{ "error": "Body too large" }` when
`err.type === 'entity.too.large'`. Test it with `app.use(express.json({ limit: '10b' }))`.
(Then remove the limit again.)
