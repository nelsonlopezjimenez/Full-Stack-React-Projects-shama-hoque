import path from 'node:path'

// [BEGINNER] Every setting that can differ between computers (your laptop, a classmate's, the
// production server) is read here, in ONE place, from environment variables.
// process.env is filled from the real environment and, in development, from the .env file:
// the npm scripts start Node with --env-file-if-exists=.env (Node 22.9+), so the `dotenv`
// package is not needed.
// [BEGINNER] NODE_ENV says where the code runs: 'development' on your computer, 'production'
// on the real server. Some settings depend on it (e.g. secure cookies need HTTPS).
const env = process.env.NODE_ENV || 'development'

// [ADVANCED] Fail fast: in production the server refuses to start without a real secret.
// With the fallback below, a server deployed without JWT_SECRET would sign tokens with a
// secret that is published on GitHub, so anyone could forge a login for any user.
if (env === 'production' && !process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET must be set in production')
}

const config = {
  env,
  // [BEGINNER] `??` only falls back when the value is null/undefined; `||` also replaces '' and 0.
  // Environment variables are always strings, so Number() turns '3000' into 3000.
  port: Number(process.env.PORT ?? 3000),
  // [BEGINNER] The secret that signs the tokens. Whoever knows it can make valid tokens for any
  // user, so the real value lives only in .env (never in git). The fallback is for development only.
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
  // Folder of a built client to serve (e.g. ../client/dist), relative to the server folder.
  // [BEGINNER] import.meta.dirname (Node 20.11+) is the ES-module replacement for __dirname.
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
