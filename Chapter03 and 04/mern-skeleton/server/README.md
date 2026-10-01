# mern-skeleton — server

This is the Express 5 + Mongoose 9 JSON API. It is a native ES module package, so there is no build step, no Babel and no nodemon.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | `node --watch` (restarts on file changes) + `.env` |
| `npm start` | runs the server + `.env` if present |
| `npm test` | `node --test` — 19 tests, no database needed |
| `npm run test:watch` | tests in watch mode |

## Environment (`.env`, see `.env.example`)

| Variable | Default | Notes |
|---|---|---|
| `PORT` | `3000` | |
| `MONGODB_URI` | `mongodb://localhost:27017/mernskeleton` | Add `?directConnection=true` if your local MongoDB is a replica set with a container host name |
| `JWT_SECRET` | dev-only value | **required** when `NODE_ENV=production` (the server refuses to start without it) |
| `JWT_EXPIRES_IN` | `1d` | token lifetime |
| `JWT_COOKIE_MAX_AGE_MS` | `86400000` | cookie lifetime, keep it equal to the token lifetime |
| `CORS_ORIGIN` | empty (CORS off) | comma-separated origins, only when the client runs on another origin |
| `CLIENT_DIST` | empty (API only) | folder of a built client to serve, e.g. `../client/dist` |

## Layout

```
server.js            connect to MongoDB (and wait for the indexes), then listen
express.js           middleware, routes, /api 404, central error handler
config/config.js     every environment variable in one place
routes/              URL → middleware chain (REST routes)
controllers/         request handlers (async, no try/catch — Express 5 forwards errors)
models/user.model.js schema, password hashing (scrypt), toJSON hides the hash
helpers/             dbErrorHandler (readable DB errors), logger (dev-only debug)
tests/               1-unit … 4-HTTP, in order of difficulty
api.http             manual end-to-end walkthrough (VS Code REST Client)
lessons/             one note per teaching stage
```

## Sign-in token

`POST /api/auth/sessions` returns a JWT and also sets it in the httpOnly cookie `t`.
`requireSignin` reads the cookie first and falls back to an `Authorization: Bearer <token>` header,
so browsers need nothing but the cookie, and other clients can use the header.

## Lessons

This server was built in 19 stages, from an empty folder to this code. Each stage is a branch
(`teach/ch03-server-01-hello` … `teach/ch03-server-19-tests`) and has a note in [`lessons/`](lessons/):

| # | Lesson | # | Lesson |
|---|---|---|---|
| 01 | [Hello, Express](lessons/01-hello.md) | 11 | [Authorization (403)](lessons/11-authorization.md) |
| 02 | [Users in memory](lessons/02-memory-users.md) | 12 | [Signed cookie](lessons/12-signed-cookie.md) |
| 03 | [MongoDB and Mongoose](lessons/03-mongodb.md) | 13 | [JSON Web Tokens](lessons/13-jwt-cookie.md) |
| 04 | [Read one user](lessons/04-read-one.md) | 14 | [Password hashing](lessons/14-password-hashed.md) |
| 05 | [Delete a user](lessons/05-delete.md) | 15 | [Mass assignment](lessons/15-mass-assignment.md) |
| 06 | [Update a user (REST table)](lessons/06-update.md) | 16 | [Security headers (helmet)](lessons/16-helmet.md) |
| 07 | [One job per file](lessons/07-split.md) | 17 | [Logging and production](lessons/17-logging.md) |
| 08 | [Error handling](lessons/08-errors.md) | 18 | [CORS and serving a client](lessons/18-client-ready.md) |
| 09 | [Passwords and signing in](lessons/09-password-plain.md) | 19 | [Tests](lessons/19-tests.md) |
| 10 | [A cookie session](lessons/10-cookie-session.md) | | |

See one lesson as a diff: `git diff teach/ch03-server-03-mongodb teach/ch03-server-04-read-one -- .`
