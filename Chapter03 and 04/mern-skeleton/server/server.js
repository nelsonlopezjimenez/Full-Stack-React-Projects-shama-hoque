// [BEGINNER] With "type": "module" in package.json, Node runs these `import` lines natively.
// Relative imports (our own files) need the full file name, including `.js`.
import config from './config/config.js'
import app from './express.js'
import mongoose from 'mongoose'
import User from './models/user.model.js'
import logger from './helpers/logger.js'

// [BEGINNER] This file only STARTS the server: connect to the database, then listen.
// What the server does (middleware, routes) is built in express.js.

// [BEGINNER] Top-level await: in an ES module you can `await` outside any function.
// The server only starts listening AFTER the database is ready, so no request can arrive
// while Mongoose is still connecting.
try {
  await mongoose.connect(config.mongoUri)
  // [ADVANCED] `unique: true` only creates a MongoDB index, and Mongoose builds indexes in the
  // background after connecting. Without this line, two signups with the same email right after
  // a fresh start can both succeed. Model.init() resolves once the indexes exist.
  await User.init()
  logger.info('Connected to MongoDB: %s', config.mongoUri)
} catch (err) {
  logger.error('Unable to connect to database %s: %s', config.mongoUri, err.message)
  // [BEGINNER] A non-zero exit code tells the shell (or Docker) that startup failed.
  process.exit(1)
}

// [BEGINNER] listen() starts the server. The callback runs once it is ready for requests.
// [ADVANCED] Express 5 calls this callback with an error when listen fails
// (for example EADDRINUSE when the port is taken), so the check below works.
app.listen(config.port, (err) => {
  if (err) {
    logger.error(err.message)
    process.exit(1)
  }
  logger.info('Server started on port %s.', config.port)
  if (config.clientDist) logger.info('Serving client from %s', config.clientDist)
})
