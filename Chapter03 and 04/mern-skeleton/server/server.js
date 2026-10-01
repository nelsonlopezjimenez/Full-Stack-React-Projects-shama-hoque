import config from './config/config.js'
import app from './express.js'
import mongoose from 'mongoose'
import User from './models/user.model.js'

try {
  await mongoose.connect(config.mongoUri)
  await User.init()
  console.log(`Connected to MongoDB: ${config.mongoUri}`)
} catch (err) {
  console.error(`Unable to connect to database ${config.mongoUri}: ${err.message}`)
  process.exit(1)
}

app.listen(config.port, () => {
  console.log(`Server started on http://localhost:${config.port}`)
})
