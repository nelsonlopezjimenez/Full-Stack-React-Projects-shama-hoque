import path from 'node:path'

const env = process.env.NODE_ENV || 'development'

if (env === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in production')
}

const config = {
  env,
  port: Number(process.env.PORT ?? 3000),
  jwtSecret: process.env.JWT_SECRET ?? 'dev-only-secret-do-not-use-in-production',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  jwtCookieMaxAgeMs: Number(process.env.JWT_COOKIE_MAX_AGE_MS ?? 24 * 60 * 60 * 1000),
  corsOrigins: (process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean),
  clientDist: process.env.CLIENT_DIST
    ? path.resolve(import.meta.dirname, '..', process.env.CLIENT_DIST)
    : null,
  mongoUri: process.env.MONGODB_URI ||
    process.env.MONGO_HOST ||
    'mongodb://' + (process.env.IP || 'localhost') + ':' +
    (process.env.MONGO_PORT || '27017') +
    '/mernskeleton'
}

export default config
