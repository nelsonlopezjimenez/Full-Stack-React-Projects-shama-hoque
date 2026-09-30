// [BEGINNER] process.env is filled from the real environment and, in development, from the
// .env file: the npm scripts start Node with --env-file-if-exists=.env (Node 22.9+), so the
// `dotenv` package is no longer needed.
const env = process.env.NODE_ENV || 'development'

// [ADVANCED] Fail fast: in production the server refuses to start without a real secret.
// With the book's fallback, a server deployed without JWT_SECRET signed tokens with a
// secret that is published on GitHub, so anyone could forge a login for any user.
if (env === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in production')
}

const config = {
  env,
  // [BEGINNER] `??` only falls back when the value is null/undefined; `||` also replaces '' and 0.
  port: Number(process.env.PORT ?? 3000),
  jwtSecret: process.env.JWT_SECRET ?? 'dev-only-secret-do-not-use-in-production',
  // Any format accepted by jsonwebtoken: '1d', '12h', '15m', or a number of seconds.
  jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? '1d',
  // The cookie should expire together with the token (1 day in milliseconds by default).
  jwtCookieMaxAgeMs: Number(process.env.JWT_COOKIE_MAX_AGE_MS ?? 24 * 60 * 60 * 1000),
  // Comma-separated list of browser origins allowed to call the API, e.g.
  // CORS_ORIGIN=https://app.example.com,http://localhost:4173 — empty means CORS stays off.
  corsOrigins: (process.env.CORS_ORIGIN ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean), // [BEGINNER] filter(Boolean) drops empty strings

  mongoUri: process.env.MONGODB_URI ||
    process.env.MONGO_HOST ||
    'mongodb://' + (process.env.IP || 'localhost') + ':' +
    (process.env.MONGO_PORT || '27017') +
    '/mernproject'
}

export default config
