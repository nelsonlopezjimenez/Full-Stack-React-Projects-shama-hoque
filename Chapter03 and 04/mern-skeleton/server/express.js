import express from 'express'
import cookieParser from 'cookie-parser'
import compress from 'compression'
import cors from 'cors'
import helmet from 'helmet'
import userRoutes from './routes/user.routes.js'
import authRoutes from './routes/auth.routes.js'

// [BEGINNER] This file only *builds* the app and exports it. server.js is the file that
// starts it (connects to the DB, calls listen). Keeping them apart lets tests import the
// app without opening a port or a database connection.
const app = express()

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
app.use(helmet())
// enable CORS - Cross Origin Resource Sharing
app.use(cors())

// mount routes
app.use('/', userRoutes)
app.use('/', authRoutes)

// [ADVANCED] Server-side rendering (React renderToString + MUI/JSS + devBundle + the
// app.get('*') catch-all) was removed. The client is now its own Vite project, and the
// server does not import any client code, so the two packages stay independent.

// [BEGINNER] Any /api request that did not match a route above ends here.
// Without it, Express answers with an HTML "Cannot GET ..." page, which a JSON client cannot parse.
app.use('/api', (req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` })
})

// Catch unauthorised errors
// [BEGINNER] Express recognises an error handler by its FOUR parameters (err, req, res, next).
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    // `return` stops here; the original code had no return and no next(err), so every
    // other kind of error left the request hanging until the client timed out.
    return res.status(401).json({ error: `${err.name}: ${err.message}` })
  }
  next(err)
})

export default app
