// [BEGINNER] With "type": "module" in package.json, Node runs these `import` lines natively.
// Relative imports need the full file name, including `.js`; Babel/webpack used to add it for us.
import config from './config/config.js'
import app from './express.js'
import mongoose from 'mongoose'
import User from './models/user.model.js'

// [BEGINNER] Top-level await: in an ES module you can `await` outside any function.
// The server only starts listening AFTER the database is ready, so no request can arrive
// while Mongoose is still connecting (the book started both at the same time).
// `mongoose.Promise = global.Promise` is gone: Mongoose has used native Promises since v5.
try {
  await mongoose.connect(config.mongoUri)
  // [ADVANCED] `unique: true` is not a validator, it only creates a MongoDB index, and
  // Mongoose builds indexes in the background after connecting. Without this line, two
  // signups with the same email right after a fresh start both succeeded (seen in the log).
  // Model.init() resolves once the indexes exist. In production, indexes are usually created
  // by a migration script and autoIndex is turned off.
  await User.init()
  console.info('Connected to MongoDB: %s', config.mongoUri)
} catch (err) {
  // Bug fix (step 2.5): the original used `${mongoUri}`, a variable that does not exist here,
  // so this handler crashed with a ReferenceError instead of showing the real problem.
  console.error('Unable to connect to database %s: %s', config.mongoUri, err.message)
  // [BEGINNER] A non-zero exit code tells the shell (or Docker, or systemd) that startup failed.
  process.exit(1)
}

// [ADVANCED] Express 5 calls this callback with an error when listen fails
// (for example EADDRINUSE when the port is taken), so the check below now works.
app.listen(config.port, (err) => {
  if (err) {
    console.error(err.message)
    process.exit(1)
  }
  console.info('Server started on port %s.', config.port)
})
