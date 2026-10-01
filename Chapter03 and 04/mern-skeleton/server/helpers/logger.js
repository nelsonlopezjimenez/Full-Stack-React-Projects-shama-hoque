import config from '../config/config.js'

const isDev = config.env === 'development'

const logger = {
  info: (...args) => console.info(...args),
  error: (...args) => console.error(...args),
  debug: (...args) => {
    if (isDev) console.debug(...args)
  }
}

export const requestLogger = (req, res, next) => {
  if (!isDev) return next()
  const start = performance.now()
  res.on('finish', () => {
    const ms = (performance.now() - start).toFixed(1)
    console.debug(`${req.method} ${req.originalUrl} → ${res.statusCode} (${ms} ms)`)
  })
  next()
}

export default logger
