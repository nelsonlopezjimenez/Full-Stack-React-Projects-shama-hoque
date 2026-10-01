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
import userRoutes from './routes/user.routes.js'

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

// mount routes
// [BEGINNER] Every route for /api/users is defined in routes/user.routes.js. app.use() plugs the
// whole router into the app. To find "what happens on PATCH /api/users/:id", open the routes file.
app.use('/', userRoutes)

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
