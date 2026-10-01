import User from '../models/user.model.js'

// [BEGINNER] A controller holds the functions that answer requests ("handlers"). Each one gets
// (req, res) and sends one answer. Which URL calls which handler is NOT decided here; that is
// the routes' job. So these functions can be read (and tested) on their own.
//
// [BEGINNER] Talking to a database takes time, so Mongoose returns a Promise ("I will have the
// answer later"). An `async` function can `await` it: the next line runs once the answer is there,
// and the server keeps serving other requests in the meantime.
//
// [ADVANCED] There is no try/catch here on purpose. Express 5 notices when an async handler's
// Promise rejects and calls next(err) for us, so every error (validation, duplicate key,
// invalid id, database down) ends up in ONE error handler at the bottom of express.js.
// With Express 4 you needed try/catch + next(err) in every handler, or a wrapper such as
// express-async-handler.

const create = async (req, res) => {
  // [BEGINNER] new User(...) builds a document from the body; fields that are not in the
  // schema are dropped. save() checks the schema rules and writes it to MongoDB.
  const user = new User(req.body)
  // [BEGINNER] If a rule fails (no name, bad email, email already used) save() throws an error.
  // It goes to the error handler in express.js, which answers 400 with a readable message.
  await user.save()
  // [BEGINNER] 201 Created is the status for "a new item was created" (200 just means OK).
  return res.status(201).json({
    message: "Successfully signed up!"
  })
}

/**
 * Load user and append to req.
 */
// [BEGINNER] Middleware (req, res, next): it loads the user named in the URL into req.profile,
// so the handlers after it (read, update, remove) do not repeat the query.
// It either ANSWERS (404) or calls next() to pass the request on to the next function in the route.
// `req.params.userId` is the `:userId` part of the route path.
const userByID = async (req, res, next) => {
  // An id that is not a valid ObjectId throws a CastError → 400 in the error handler.
  const user = await User.findById(req.params.userId)
  // [BEGINNER] findById answers null when no user has this id. `return` stops the function
  // here, so we never send two answers to one request.
  if (!user) {
    // [BEGINNER] 404 Not Found: the id is well-formed but no such user exists
    return res.status(404).json({ error: "User not found" })
  }
  // [BEGINNER] req is one object that travels through every function of the route, so
  // anything stored on it here (req.profile) is visible to read/update/remove.
  req.profile = user
  next()
}

const read = (req, res) => {
  // hashed_password and salt are removed by the schema's toJSON transform (user.model.js)
  return res.json(req.profile)
}

const list = async (req, res) => {
  // [BEGINNER] .select() limits the fields returned, so passwords never leave the database here.
  const users = await User.find().select('name email updated created')
  res.json(users)
}

const update = async (req, res) => {
  // [BEGINNER] Object.assign(target, a, b) copies every property of a and b onto target.
  // Here: the fields from the body, then the date of this change.
  // [ADVANCED] Copying EVERYTHING the client sends is dangerous ("mass assignment"): a client can
  // also change fields it should never touch. Stage 15 shows the attack and fixes it.
  // Assigning `password` goes through the schema's `password` virtual, which hashes it.
  const user = Object.assign(req.profile, req.body, { updated: Date.now() })
  // [BEGINNER] save() runs the schema rules again, so an update cannot break them
  // (an empty name or an invalid email is refused, just like on create).
  await user.save()
  res.json(user)
}

const remove = async (req, res) => {
  const user = req.profile
  // [BEGINNER] deleteOne() removes this document from the collection.
  await user.deleteOne()
  // We answer with the user that was deleted, so the client can show "Bob was deleted".
  res.json(user)
}

// [BEGINNER] One default export with all handlers, used as userCtrl.list, userCtrl.create ...
// `remove`, not `delete`: `delete` is a reserved word in JavaScript.
export default {
  create,
  userByID,
  read,
  list,
  remove,
  update
}
