import path from 'node:path'
import express from 'express'
import cookieParser from 'cookie-parser'
import compress from 'compression'
import cors from 'cors'
import helmet from 'helmet'
import userRoutes from './routes/user.routes.js'
import authRoutes from './routes/auth.routes.js'
import dbErrorHandler from './helpers/dbErrorHandler.js'
import config from './config/config.js'
import logger, { requestLogger } from './helpers/logger.js'

// [BEGINNER] This file only *builds* the app and exports it. server.js is the file that
// starts it (connects to the DB, calls listen). Keeping them apart lets tests import the
// app without opening a port or a database connection.
const app = express()

// development only: one line per request, e.g. "GET /api/users → 200 (3.1 ms)"
// [BEGINNER] It is the first middleware, so it sees every request, including the ones that
// end in a 404 or an error.
app.use(requestLogger)

// parse body params and attach them to req.body
// [BEGINNER] Middleware: a function that runs for EVERY request, before the routes.
// express.json() reads a JSON request body (Content-Type: application/json) and puts the
// parsed object in req.body. Without it, req.body is undefined.
app.use(express.json())
// [BEGINNER] HTML forms send their data URL-encoded (name=Ann&email=a%40b.c) instead of as JSON;
// this middleware reads that format into req.body too.
// [ADVANCED] Express 5 changed the default to `extended: false` (Node's querystring
// instead of the `qs` library). We pass `true` to keep the book's behaviour for nested
// fields like a[b]=1. The React client only sends JSON, so this line could also be removed.
app.use(express.urlencoded({ extended: true }))
// [BEGINNER] cookie-parser reads the Cookie header of every request into the object req.cookies.
// No secret any more: the JWT inside the cookie carries its own signature.
app.use(cookieParser())
// [BEGINNER] compression gzips large answers (Content-Encoding: gzip) when the client accepts it,
// so less data travels over the network.
app.use(compress())
// secure apps by setting various HTTP headers
// [ADVANCED] helmet 8 (the book had v3) sets a Content-Security-Policy by default, plus HSTS,
// X-Content-Type-Options, a strict Referrer-Policy, and removes X-Powered-By. For a JSON API
// the defaults are fine; they also work for the built Vite client if it is served from here.
app.use(helmet())

// enable CORS - Cross Origin Resource Sharing
// [BEGINNER] CORS is only needed when the browser page and the API are on DIFFERENT origins
// (scheme + host + port). In development the Vite proxy makes them the same origin, and in a
// single-process deploy Express serves both, so CORS stays off unless CORS_ORIGIN is set.
// [ADVANCED] The book's cors() with no options allowed EVERY origin. An explicit allow-list is
// required anyway once `credentials: true` (cookies) is used: browsers reject
// Access-Control-Allow-Origin: * together with credentials. (See chat/ch02-cors-express-client.md.)
if (config.corsOrigins.length > 0) {
  app.use(cors({ origin: config.corsOrigins, credentials: true }))
}

// mount routes
// [BEGINNER] Every route for /api/users is defined in routes/user.routes.js, every route for
// /api/auth in routes/auth.routes.js. app.use() plugs each router into the app.
app.use('/', userRoutes)
app.use('/', authRoutes)

// [BEGINNER] Any /api request that did not match a route above ends here.
// Without it, Express answers with an HTML "Cannot GET ..." page, which a JSON client cannot parse.
app.use('/api', (req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` })
})

// Optional: serve a built client
// [BEGINNER] The React client is its own Vite project and the server imports NO client code, so
// the two packages stay independent. For a single-process deploy, run `npm run build` in
// ../client and start the server with CLIENT_DIST=../client/dist.
// Without CLIENT_DIST the server is a pure JSON API (the client can live on a CDN).
// [ADVANCED] The book rendered React on the server (renderToString + webpack devBundle + an
// app.get('*') catch-all); that was removed in refactor/ch03-migration.
if (config.clientDist) {
  app.use(express.static(config.clientDist))

  // [BEGINNER] SPA fallback: a page URL such as /users/123 exists only in React Router, not on
  // the server, so every other GET returns index.html and React Router picks the page.
  // [ADVANCED] Express 5 (path-to-regexp v8) no longer accepts a bare '*'. A wildcard needs a
  // name: '/*splat' matches everything except '/', '/{*splat}' also matches '/'.
  // (React Router still writes its catch-all as path="*": different library, different syntax.)
  app.get('/{*splat}', (req, res, next) => {
    // A missing file such as /assets/app-123.js should be a real 404, not index.html.
    if (path.extname(req.path)) return next()
    res.sendFile(path.join(config.clientDist, 'index.html'))
  })
}

// Central error handler: every error from every route ends here.
// [BEGINNER] Express recognises an error handler by its FOUR parameters (err, req, res, next).
// It must be registered last, after all routes.
// [ADVANCED] Errors arrive here three ways: next(err), a `throw` in a synchronous handler,
// and (new in Express 5) a rejected Promise from an async handler. That is why the
// controllers need no try/catch: when `await user.save()` fails, the error comes here.
app.use((err, req, res, next) => {
  // If part of the response was already sent, only Express's default handler can close it.
  if (res.headersSent) return next(err)

  // Missing or invalid JWT (thrown by express-jwt in requireSignin)
  if (err.name === 'UnauthorizedError') {
    // [BEGINNER] `return` stops here, so only one answer is sent.
    return res.status(401).json({ error: `${err.name}: ${err.message}` })
  }
  // Mongoose schema validation, or a duplicate email (MongoDB error code 11000)
  if (err.name === 'ValidationError' || err.code === 11000) {
    return res.status(400).json({ error: dbErrorHandler.getErrorMessage(err) })
  }
  // A value that cannot be converted to the schema type, e.g. /api/users/not-an-id
  if (err.name === 'CastError') {
    return res.status(400).json({ error: `Invalid ${err.path}: ${err.value}` })
  }

  // [ADVANCED] express.json() sets err.status = 400 for malformed JSON. Anything without a
  // status is a bug or an outage → 500. Log the details on the server, but do not send the
  // stack trace or the internal message to the client.
  const status = err.status ?? err.statusCode ?? 500
  if (status >= 500) logger.error(err)
  res.status(status).json({ error: status >= 500 ? 'Internal server error' : err.message })
})

export default app
