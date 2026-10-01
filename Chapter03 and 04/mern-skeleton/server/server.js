import express from 'express'
import mongoose from 'mongoose'

const app = express()

const port = 3000

const mongoUri = 'mongodb://localhost:27017/mernskeleton?directConnection=true'

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
    required: [true, 'Name is required.']
  },
  email: {
    type: String,
    trim: true,
    unique: true,
    match: [/.+@.+\..+/, 'Please fill a valid email address.'],
    required: [true, 'Email is required.']
  },
  updated: Date,
  created: {
    type: Date,
    default: Date.now
  }
})

const User = mongoose.model('User', UserSchema)

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello from the MERN skeleton server!')
})

app.get('/api/users', async (req, res) => {
  const users = await User.find().select('name email updated created')
  res.json(users)
})

app.post('/api/users', async (req, res) => {
  const user = new User(req.body)
  await user.save()
  res.status(201).json({ message: 'Successfully signed up!' })
})

app.get('/api/users/:userId', async (req, res) => {
  const user = await User.findById(req.params.userId)
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }
  res.json(user)
})

app.delete('/api/users/:userId', async (req, res) => {
  const user = await User.findById(req.params.userId)
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }
  await user.deleteOne()
  res.json(user)
})

try {
  await mongoose.connect(mongoUri)
  await User.init()
  console.log(`Connected to MongoDB: ${mongoUri}`)
} catch (err) {
  console.error(`Unable to connect to database ${mongoUri}: ${err.message}`)
  process.exit(1)
}

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`)
})
