import config from './../config/config.js'
import app from './express.js'
import mongoose from 'mongoose'

// mongoose.connect("mongodb://localhost:3010/mernproject")
mongoose.connect(config.mongoUri)
  .then(() => {
    console.info('Connected to MongoDB: ' + config.mongoUri)
  })
  .catch((err) => {
    throw new Error(`Unable to connect to database: ${err.message}`)
  })

app.listen(config.port, (err) => {
  if (err) {
    console.log(err)
  }
  console.info('Server started on port %s.', config.port)
})
