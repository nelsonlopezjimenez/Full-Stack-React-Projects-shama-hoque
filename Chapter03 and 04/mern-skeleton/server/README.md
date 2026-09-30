# mern-skeleton — server

This is the Express 5 + Mongoose 9 JSON API. It is a native ES module package, so there is no build step, no Babel and no nodemon.

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | `node --watch` (restarts on file changes) + `.env` |
| `npm start` | runs the server + `.env` if present |
| `npm test` | `node --test` — 18 tests, no database needed |
| `npm run test:watch` | tests in watch mode |

## Environment (`.env`, see `.env.example`)

| Variable | Default | Notes |
|---|---|---|
| `PORT` | `3000` | |
| `MONGODB_URI` | `mongodb://localhost:27017/mernproject` | Add `?directConnection=true` if your local MongoDB is a replica set with a container host name |
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
```
