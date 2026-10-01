// [BEGINNER] With "type": "module" in package.json, Node understands `import` and `export`
// (ES modules), the standard module syntax of JavaScript. No Babel or build step is needed.
import express from 'express'
// [BEGINNER] Mongoose talks to MongoDB for us and checks every document against a schema.
import mongoose from 'mongoose'
// [BEGINNER] Relative imports (our own files) need the full file name, including `.js`.
// The port and the database address now come from config/config.js (and your .env file).
import config from './config/config.js'
// The schema and the model now live in their own file.
import User from './models/user.model.js'

// [BEGINNER] express() creates the application. Everything the server does is registered on `app`.
const app = express()

// [BEGINNER] Middleware: a function that runs for EVERY request, before the routes.
// express.json() reads a JSON request body (Content-Type: application/json) and puts the
// parsed object in req.body. Without it, req.body is undefined.
app.use(express.json())

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
// [BEGINNER] Talking to a database takes time, so Mongoose returns a Promise ("I will have the
// answer later"). An `async` function can `await` it: the next line runs once the answer is there,
// and the server keeps serving other requests in the meantime.
app.get('/api/users', async (req, res) => {
  // [BEGINNER] .select() limits the fields returned: only these four (and _id) are sent.
  const users = await User.find().select('name email updated created')
  res.json(users)
})

// Create a user
app.post('/api/users', async (req, res) => {
  // [BEGINNER] new User(...) builds a document from the body; fields that are not in the
  // schema are dropped. save() checks the schema rules and writes it to MongoDB.
  const user = new User(req.body)
  // [BEGINNER] If a rule fails (no name, bad email, email already used) save() throws an error.
  // Nothing catches it yet, so Express answers with an ugly 500 page. Stage 08 fixes that.
  await user.save()
  // [BEGINNER] 201 Created is the status for "a new item was created" (200 just means OK).
  res.status(201).json({ message: 'Successfully signed up!' })
})

// Read one user
// [BEGINNER] `:userId` is a route parameter: a placeholder for any value in that part of the URL.
// For GET /api/users/66fb12...e1, Express puts '66fb12...e1' in req.params.userId.
// REST: /api/users is the collection, /api/users/<id> is ONE item of it.
app.get('/api/users/:userId', async (req, res) => {
  const user = await User.findById(req.params.userId)
  // [BEGINNER] findById answers null when no user has this id. `return` stops the function
  // here, so we never send two answers to one request.
  if (!user) {
    // 404 Not Found: the id is well-formed but no such user exists
    return res.status(404).json({ error: 'User not found' })
  }
  res.json(user)
})

// Update one user
// [BEGINNER] PATCH means "change SOME fields": the client sends only what changes, for example
// { "name": "Ann B." }. PUT would mean "replace the whole user", so the client would have to
// send every field, and a missing field would be erased.
app.patch('/api/users/:userId', async (req, res) => {
  const user = await User.findById(req.params.userId)
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }
  // [BEGINNER] Object.assign(target, a, b) copies every property of a and b onto target.
  // Here: the fields from the body, then the date of this change.
  // [ADVANCED] Copying EVERYTHING the client sends is dangerous ("mass assignment"): a client can
  // also change fields it should never touch. Stage 15 shows the attack and fixes it.
  Object.assign(user, req.body, { updated: Date.now() })
  // [BEGINNER] save() runs the schema rules again, so an update cannot break them
  // (an empty name or an invalid email is refused, just like on create).
  await user.save()
  res.json(user)
})

// Delete one user
// [BEGINNER] Same URL as "read one", different method: the method is the verb.
app.delete('/api/users/:userId', async (req, res) => {
  const user = await User.findById(req.params.userId)
  if (!user) {
    return res.status(404).json({ error: 'User not found' })
  }
  // [BEGINNER] deleteOne() removes this document from the collection.
  await user.deleteOne()
  // We answer with the user that was deleted, so the client can show "Bob was deleted".
  res.json(user)
})

// [BEGINNER] Top-level await: in an ES module you can `await` outside any function.
// The server only starts listening AFTER the database is ready, so no request can arrive
// while Mongoose is still connecting.
try {
  await mongoose.connect(config.mongoUri)
  // [ADVANCED] `unique: true` only creates a MongoDB index, and Mongoose builds indexes in the
  // background after connecting. Without this line, two signups with the same email right after
  // a fresh start can both succeed. Model.init() resolves once the indexes exist.
  await User.init()
  console.log(`Connected to MongoDB: ${config.mongoUri}`)
} catch (err) {
  console.error(`Unable to connect to database ${config.mongoUri}: ${err.message}`)
  // [BEGINNER] A non-zero exit code tells the shell (or Docker) that startup failed.
  process.exit(1)
}

// [BEGINNER] listen() starts the server. The callback runs once it is ready for requests.
// `...` between backticks is a template literal: ${config.port} is replaced by the value.
app.listen(config.port, () => {
  console.log(`Server started on http://localhost:${config.port}`)
})
