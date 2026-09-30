// [BEGINNER] process.env is filled from the real environment and, in development, from the
// .env file: the npm scripts start Node with --env-file-if-exists=.env (Node 22.9+), so the
// `dotenv` package is no longer needed.
const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3000,
  jwtSecret: process.env.JWT_SECRET || "YOUR_secret_key",
  mongoUri: process.env.MONGODB_URI ||
    process.env.MONGO_HOST ||
    'mongodb://' + (process.env.IP || 'localhost') + ':' +
    (process.env.MONGO_PORT || '27017') +
    '/mernproject'
}

export default config
