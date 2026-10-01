# Stage 17 — Logging, and running in production

**Branch:** `teach/ch03-server-17-logging`

## Goal

The terminal shows one line per request while you develop, and stays quiet and safe in production.
A production server without its secret refuses to start.

## New ideas

- **A logger instead of `console.log` everywhere.** `helpers/logger.js` has three functions:
  - `logger.info` — normal events (connected, started)
  - `logger.error` — something failed
  - `logger.debug` — details that only help while developing; **printed only when `NODE_ENV` is
    `development`**
  The code can keep its debug lines, and production logs never contain them.
- **Request logger.** A middleware that measures each request and prints, when the answer has been sent
  (the `'finish'` event):
  ```
  POST /api/auth/sessions → 200 (41.3 ms)
  GET /api/users/66fb… → 401 (0.4 ms)
  ```
  The status and the duration show at a glance what the client saw, and which requests are slow.
  (Sign-in is slow on purpose: scrypt, stage 14.)
- **What never goes into a log:** passwords, password hashes, and tokens in production. A log is read
  by many people and tools. The JWT is printed with `logger.debug`, so only on your own computer.
- **Fail fast.** With `NODE_ENV=production` and no `JWT_SECRET`, `config.js` throws at startup.
  A server that does not start is noticed at once. A server that signs tokens with the development
  secret from GitHub is only noticed after someone uses it to sign in as any user.
- **Format strings.** `logger.info('Server started on port %s.', config.port)`, where `%s` is replaced by
  the next argument (the same as `console.log`).

[ADVANCED] In production you would use a structured logger (pino, winston) that writes JSON lines
for a log service to collect. This small logger has the same three-level interface.

## Try it

1. `npm run dev`, then send a few requests: each one shows up in the terminal with its status.
2. Sign in: the token is printed (debug).
3. Stop the server and start it as production without a secret:
   ```bash
   NODE_ENV=production JWT_SECRET= node server.js     # bash
   ```
   (PowerShell: `$env:NODE_ENV='production'; $env:JWT_SECRET=''; node server.js`, then close that
   terminal.) It stops with "JWT_SECRET must be set in production".
4. With a secret (`JWT_SECRET=abc node server.js` plus `NODE_ENV=production`): it starts, and requests
   and tokens are **not** printed.

## Exercise

Make the request logger also print `req.auth._id` when the request was signed in. Why is the id
fine to log, when the token is not?
