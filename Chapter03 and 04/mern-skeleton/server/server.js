// [BEGINNER] With "type": "module" in package.json, Node runs these `import` lines natively.
// Relative imports need the full file name, including `.js`; Babel/webpack used to add it for us.
import config from './config/config.js'
import app from './express.js'
import mongoose from 'mongoose'

// Connection URL
mongoose.Promise = global.Promise
mongoose.connect(config.mongoUri)
mongoose.connection.on('error', () => {
  // Bug fix (step 2.5): the original used `${mongoUri}`, a variable that does not exist here,
  // so this handler crashed with a ReferenceError instead of showing the real problem.
  throw new Error(`unable to connect to database: ${config.mongoUri}`)
})

app.listen(config.port, (err) => {
  if (err) {
    console.log(err)
  }
  console.info('Server started on port %s.', config.port)
})
