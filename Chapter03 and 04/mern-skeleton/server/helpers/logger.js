import config from '../config/config.js'

// [BEGINNER] An environment-aware logger (same idea as Ch05, see CLAUDE-GUIDE.md "Strategy A").
// logger.debug() only prints in development, so teaching output (like a freshly issued JWT)
// can stay in the code without ever showing up in production logs.
const isDev = config.env === 'development'

const logger = {
  info: (...args) => console.info(...args),
  error: (...args) => console.error(...args),
  // [BEGINNER] `...args` (rest parameters) collects every argument into an array, and
  // `console.debug(...args)` (spread) passes them on unchanged, so format strings like
  // logger.debug('port %s', 3000) keep working.
  debug: (...args) => {
    if (isDev) console.debug(...args)
  }
}

// [ADVANCED] A tiny request logger instead of the `morgan` package: the 'finish' event fires
// after the response has been sent, so the status code and the duration are known.
// In production you would use a structured logger (pino, winston) that writes JSON lines.
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
