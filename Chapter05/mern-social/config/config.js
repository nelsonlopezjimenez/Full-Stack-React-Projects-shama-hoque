const config = {
  env: process.env.NODE_ENV || 'development',
  port: process.env.PORT || 3333,
  jwtSecret: process.env.JWT_SECRET || "YOUR_secret_key",
  mongoUri: process.env.MONGODB_URI ||
    process.env.MONGO_HOST ||
    'mongodb://' + (process.env.IP || 'localhost') + ':' +
    (process.env.MONGO_PORT || '3010') +
    '/mernproject'
}

export default config
