import express from 'express'
import cookieParser from 'cookie-parser'
import userRoutes from './routes/user.routes.js'
import authRoutes from './routes/auth.routes.js'
import dbErrorHandler from './helpers/dbErrorHandler.js'

// [BEGINNER] This file only *builds* the app and exports it. server.js is the file that
// starts it (connects to the DB, calls listen). Keeping them apart lets tests import the
// app without opening a port or a database connection.
const app = express()

// parse body params and attach them to req.body
// [BEGINNER] Middleware: a function that runs for EVERY request, before the routes.
// express.json() reads a JSON request body (Content-Type: application/json) and puts the
// parsed object in req.body. Without it, req.body is undefined.
app.use(express.json())
// [BEGINNER] cookie-parser reads the Cookie header of every request into the object req.cookies.
app.use(cookieParser())

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

// Central error handler: every error from every route ends here.
// [BEGINNER] Express recognises an error handler by its FOUR parameters (err, req, res, next).
// It must be registered last, after all routes.
// [ADVANCED] Errors arrive here three ways: next(err), a `throw` in a synchronous handler,
// and (new in Express 5) a rejected Promise from an async handler. That is why the
// controllers need no try/catch: when `await user.save()` fails, the error comes here.
app.use((err, req, res, next) => {
  // If part of the response was already sent, only Express's default handler can close it.
  if (res.headersSent) return next(err)

  // Mongoose schema validation, or a duplicate email (MongoDB error code 11000)
  // [BEGINNER] `return` stops here, so only one answer is sent.
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
  if (status >= 500) console.error(err)
  res.status(status).json({ error: status >= 500 ? 'Internal server error' : err.message })
})

export default app
