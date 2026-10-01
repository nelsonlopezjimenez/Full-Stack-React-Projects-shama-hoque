import express from 'express'
import cookieParser from 'cookie-parser'
import userRoutes from './routes/user.routes.js'
import authRoutes from './routes/auth.routes.js'
import config from './config/config.js'
import dbErrorHandler from './helpers/dbErrorHandler.js'

const app = express()

app.use(express.json())
app.use(cookieParser(config.cookieSecret))

app.use('/', userRoutes)
app.use('/', authRoutes)

app.use('/api', (req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` })
})

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err)

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
