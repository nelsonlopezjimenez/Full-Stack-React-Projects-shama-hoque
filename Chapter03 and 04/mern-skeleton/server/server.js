// [BEGINNER] With "type": "module" in package.json, Node understands `import` and `export`
// (ES modules), the standard module syntax of JavaScript. No Babel or build step is needed.
import express from 'express'

// [BEGINNER] express() creates the application. Everything the server does is registered on `app`.
const app = express()

// [BEGINNER] A port is a "door number" on this computer. http://localhost:3000 means
// "this computer, door 3000". Only one program at a time can listen on a port.
const port = 3000

// [BEGINNER] Middleware: a function that runs for EVERY request, before the routes.
// express.json() reads a JSON request body (Content-Type: application/json) and puts the
// parsed object in req.body. Without it, req.body is undefined.
app.use(express.json())

// [BEGINNER] Our "database" for now: a plain array in memory. It is empty every time the
// server starts, so every restart (and node --watch restarts on every save!) loses all users.
// The next stage replaces it with MongoDB.
const users = []
let nextId = 1

// [BEGINNER] A route = an HTTP method + a path + a function that answers.
// When a GET request for "/" arrives, Express calls this function with two objects:
//   req  the request  (what the client sent: URL, headers, body ...)
//   res  the response (what we send back)
app.get('/', (req, res) => {
  res.send('Hello from the MERN skeleton server!')
})

// [BEGINNER] REST: the URL names a collection of things (/api/users) and the HTTP method says
// what to do with it:   GET = read it,   POST = add a new item to it.
// The /api prefix keeps the data URLs apart from the pages a browser app will show later.

// List all users
app.get('/api/users', (req, res) => {
  // res.json() turns the array into JSON text and sets Content-Type: application/json
  res.json(users)
})

// Create a user
app.post('/api/users', (req, res) => {
  // [BEGINNER] Destructuring pulls properties out of an object in one line:
  // the same as  const name = req.body.name; const email = req.body.email
  // `?? {}` uses an empty object when there is no body at all.
  const { name, email } = req.body ?? {}
  // [BEGINNER] Nothing checks the data yet: an empty body creates a user without a name.
  // The database schema in the next stage will refuse that.
  const user = { _id: String(nextId++), name, email, created: new Date() }
  users.push(user)
  // [BEGINNER] 201 Created is the status for "a new item was created" (200 just means OK).
  res.status(201).json({ message: 'Successfully signed up!' })
})

// [BEGINNER] listen() starts the server. The callback runs once it is ready for requests.
// `...` between backticks is a template literal: ${port} is replaced by the value.
app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`)
})
