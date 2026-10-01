// [BEGINNER] With "type": "module" in package.json, Node understands `import` and `export`
// (ES modules), the standard module syntax of JavaScript. No Babel or build step is needed.
import express from 'express'
// [BEGINNER] Mongoose talks to MongoDB for us and checks every document against a schema.
import mongoose from 'mongoose'

// [BEGINNER] express() creates the application. Everything the server does is registered on `app`.
const app = express()

// [BEGINNER] A port is a "door number" on this computer. http://localhost:3000 means
// "this computer, door 3000". Only one program at a time can listen on a port.
const port = 3000

// [BEGINNER] Where the database is: protocol://host:port/databaseName
// MongoDB creates the database "mernskeleton" the first time something is saved in it.
// [ADVANCED] ?directConnection=true: talk only to this host. Needed when the local MongoDB is a
// replica set whose members advertise a name your machine cannot resolve (e.g. a Docker
// container called "mongodb"). A plain local MongoDB works with or without it.
const mongoUri = 'mongodb://localhost:27017/mernskeleton?directConnection=true'

// [BEGINNER] A schema describes what a user looks like and which rules every user must follow.
// MongoDB itself would store anything; Mongoose checks these rules before saving.
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true, // removes spaces at the start and the end
    // [BEGINNER] [true, 'message'] is the documented form: "required, and if missing say this".
    required: [true, 'Name is required.']
  },
  email: {
    type: String,
    trim: true,
    // [ADVANCED] `unique` is NOT a validator: it only asks MongoDB to create a unique index.
    // A common extra is `lowercase: true`, so 'A@x.io' and 'a@x.io' count as the same email.
    unique: true,
    // [BEGINNER] match: the value must fit this regular expression ("something@something.something").
    match: [/.+@.+\..+/, 'Please fill a valid email address.'],
    required: [true, 'Email is required.']
  },
  updated: Date,
  created: {
    type: Date,
    default: Date.now
  }
})

// [BEGINNER] A model is the schema + a collection in the database. 'User' → collection "users".
// User.find(), new User(...).save() and friends all talk to that collection.
const User = mongoose.model('User', UserSchema)

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

// [BEGINNER] Top-level await: in an ES module you can `await` outside any function.
// The server only starts listening AFTER the database is ready, so no request can arrive
// while Mongoose is still connecting.
try {
  await mongoose.connect(mongoUri)
  // [ADVANCED] `unique: true` only creates a MongoDB index, and Mongoose builds indexes in the
  // background after connecting. Without this line, two signups with the same email right after
  // a fresh start can both succeed. Model.init() resolves once the indexes exist.
  await User.init()
  console.log(`Connected to MongoDB: ${mongoUri}`)
} catch (err) {
  console.error(`Unable to connect to database ${mongoUri}: ${err.message}`)
  // [BEGINNER] A non-zero exit code tells the shell (or Docker) that startup failed.
  process.exit(1)
}

// [BEGINNER] listen() starts the server. The callback runs once it is ready for requests.
// `...` between backticks is a template literal: ${port} is replaced by the value.
app.listen(port, () => {
  console.log(`Server started on http://localhost:${port}`)
})
