import express from 'express'

const app = express()

const port = 3000

app.use(express.json())

const users = []
let nextId = 1

app.get('/', (req, res) => {
  res.send('Hello from the MERN skeleton server!')
})

app.get('/api/users', (req, res) => {
  res.json(users)
})

app.post('/api/users', (req, res) => {
  const { name, email } = req.body ?? {}
  const user = { _id: String(nextId++), name, email, created: new Date() }
  users.push(user)
  res.status(201).json({ message: 'Successfully signed up!' })
})

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`)
})
