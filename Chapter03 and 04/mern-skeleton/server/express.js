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
app.use(requestLogger)

// parse body params and attach them to req.body
// [BEGINNER] express.json() is built into Express (since 4.16), so the separate
// `body-parser` package is no longer needed.
app.use(express.json())
// [ADVANCED] Express 5 changed the default to `extended: false` (Node's querystring
// instead of the `qs` library). We pass `true` to keep the book's behaviour for nested
// fields like a[b]=1. The React client only sends JSON, so this line could also be removed.
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
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
app.use('/', userRoutes)
app.use('/', authRoutes)

// [BEGINNER] Any /api request that did not match a route above ends here.
// Without it, Express answers with an HTML "Cannot GET ..." page, which a JSON client cannot parse.
app.use('/api', (req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` })
})

// Optional: serve a built client (step 3.4 / 7.9)
// [ADVANCED] Server-side rendering (React renderToString + MUI/JSS + devBundle + the
// app.get('*') catch-all) was removed. The client is its own Vite project and the server
// imports NO client code, so the packages stay independent. For a single-process deploy, run
// `npm run build` in ../client and start the server with CLIENT_DIST=../client/dist.
// Without CLIENT_DIST the server is a pure JSON API (the client can live on a CDN).
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
// and (new in Express 5) a rejected Promise from an async handler.
app.use((err, req, res, next) => {
  // If part of the response was already sent, only Express's default handler can close it.
  if (res.headersSent) return next(err)

  // Missing or invalid JWT (thrown by express-jwt in requireSignin)
  if (err.name === 'UnauthorizedError') {
    // `return` stops here; the book's handler had no return and no next(err), so every
    // other kind of error left the request hanging until the client timed out.
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
