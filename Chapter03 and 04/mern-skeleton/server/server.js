import express from 'express'

const app = express()

const port = 3000

app.get('/', (req, res) => {
  res.send('Hello from the MERN skeleton server!')
})

app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`)
})
