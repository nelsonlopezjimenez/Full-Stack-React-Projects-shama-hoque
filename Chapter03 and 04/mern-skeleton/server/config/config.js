// [BEGINNER] Every setting that can differ between computers (your laptop, a classmate's, the
// production server) is read here, in ONE place, from environment variables.
// process.env is filled from the real environment and, in development, from the .env file:
// the npm scripts start Node with --env-file-if-exists=.env (Node 22.9+), so the `dotenv`
// package is not needed.
// [BEGINNER] NODE_ENV says where the code runs: 'development' on your computer, 'production'
// on the real server. Some settings depend on it (e.g. secure cookies need HTTPS).
const env = process.env.NODE_ENV || 'development'

const config = {
  env,
  // [BEGINNER] `??` only falls back when the value is null/undefined; `||` also replaces '' and 0.
  // Environment variables are always strings, so Number() turns '3000' into 3000.
  port: Number(process.env.PORT ?? 3000),
  // [BEGINNER] The secret that signs the sign-in cookie. Whoever knows it can make valid cookies,
  // so the real value lives only in .env (never in git). The fallback is for development only.
  cookieSecret: process.env.COOKIE_SECRET ?? 'dev-only-secret-do-not-use-in-production',
  mongoUri: process.env.MONGODB_URI ||
    process.env.MONGO_HOST ||
    'mongodb://' + (process.env.IP || 'localhost') + ':' +
    (process.env.MONGO_PORT || '27017') +
    '/mernskeleton'
}

export default config
