const env = process.env.NODE_ENV || 'development'

const config = {
  env,
  port: Number(process.env.PORT ?? 3000),
  cookieSecret: process.env.COOKIE_SECRET ?? 'dev-only-secret-do-not-use-in-production',
  mongoUri: process.env.MONGODB_URI ||
    process.env.MONGO_HOST ||
    'mongodb://' + (process.env.IP || 'localhost') + ':' +
    (process.env.MONGO_PORT || '27017') +
    '/mernskeleton'
}

export default config
