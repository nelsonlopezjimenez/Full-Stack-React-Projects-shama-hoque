import express from 'express'
import cookieParser from 'cookie-parser'
import compress from 'compression'
import helmet from 'helmet'
import userRoutes from './routes/user.routes.js'
import authRoutes from './routes/auth.routes.js'
import dbErrorHandler from './helpers/dbErrorHandler.js'

const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())
app.use(compress())
app.use(helmet())

app.use('/', userRoutes)
app.use('/', authRoutes)

app.use('/api', (req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` })
})

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err)

  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: `${err.name}: ${err.message}` })
  }
  if (err.name === 'ValidationError' || err.code === 11000) {
    return res.status(400).json({ error: dbErrorHandler.getErrorMessage(err) })
  }
  if (err.name === 'CastError') {
    return res.status(400).json({ error: `Invalid ${err.path}: ${err.value}` })
  }

  const status = err.status ?? err.statusCode ?? 500
  if (status >= 500) console.error(err)
  res.status(status).json({ error: status >= 500 ? 'Internal server error' : err.message })
})

export default app
