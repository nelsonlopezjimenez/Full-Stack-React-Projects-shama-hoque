import config from './config/config.js'
import app from './express.js'
import mongoose from 'mongoose'
import User from './models/user.model.js'
import logger from './helpers/logger.js'

try {
  await mongoose.connect(config.mongoUri)
  await User.init()
  logger.info('Connected to MongoDB: %s', config.mongoUri)
} catch (err) {
  logger.error('Unable to connect to database %s: %s', config.mongoUri, err.message)
  process.exit(1)
}

app.listen(config.port, (err) => {
  if (err) {
    logger.error(err.message)
    process.exit(1)
  }
  logger.info('Server started on port %s.', config.port)
  if (config.clientDist) logger.info('Serving client from %s', config.clientDist)
})
