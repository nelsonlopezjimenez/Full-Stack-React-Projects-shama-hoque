import User from '../models/user.model.js'

// [BEGINNER] Mongoose 7+ removed callbacks: user.save(cb) or User.find(cb) no longer work.
// Every query now returns a Promise, so the functions are `async` and use `await`.
//
// [ADVANCED] There is no try/catch here on purpose. Express 5 notices when an async handler's
// Promise rejects and calls next(err) for us, so every error (validation, duplicate key,
// invalid id, database down) ends up in ONE error handler at the bottom of express.js.
// With Express 4 you needed try/catch + next(err) in every handler, or a wrapper such as
// express-async-handler. (The previous commit on this branch shows the try/catch version.)
const create = async (req, res) => {
  const user = new User(req.body)
  await user.save()
  // [BEGINNER] 201 Created is the REST status for "a new resource was created".
  return res.status(201).json({
    message: "Successfully signed up!"
  })
}

/**
 * Load user and append to req.
 */
// [BEGINNER] Ordinary middleware (req, res, next): it loads the user named in the URL into
// req.profile, so the handlers after it (read, update, remove) do not repeat the query.
// `req.params.userId` is the `:userId` part of the route path.
//
// [ADVANCED] The book registered this as router.param('userId', userByID), a 4-parameter
// callback (req, res, next, id). Measured on Express 5: a param callback runs BEFORE all route
// middleware, so the real order was userByID → requireSignin → read (not the
// requireSignin → userByID → read written in the Ch05 notes). Effects: a request WITHOUT a
// token still queried the database, and answered 404 "User not found" for unknown ids
// instead of 401 — a way to probe which ids exist. Listing it explicitly in the route after
// requireSignin makes the order visible and fixes both. router.param is still a good fit when
// every route using the param is public, or when you want the lookup to happen first.
const userByID = async (req, res, next) => {
  // An id that is not a valid ObjectId throws a CastError → 400 in the error handler.
  const user = await User.findById(req.params.userId)
  if (!user) {
    // [BEGINNER] 404 Not Found: the id is well-formed but no such user exists
    // (the book answered 400 for every problem).
    return res.status(404).json({ error: "User not found" })
  }
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

// [ADVANCED] The book did `_.extend(user, req.body)`: every field in the request body was
// copied onto the document, so a user could also send hashed_password, salt or created
// ("mass assignment"). Only the fields in this allow-list can be changed now.
const UPDATABLE_FIELDS = ['name', 'email', 'password']

const update = async (req, res) => {
  const body = req.body ?? {}
  // [BEGINNER] Object.fromEntries turns [['name', 'Ann'], ['email', 'a@b.c']] into
  // { name: 'Ann', email: 'a@b.c' }. Fields the client did not send are left out, so a PATCH
  // with only a new name does not touch the email.
  const changes = Object.fromEntries(
    UPDATABLE_FIELDS
      .filter((field) => body[field] !== undefined)
      .map((field) => [field, body[field]])
  )
  // [BEGINNER] Object.assign copies properties onto the existing document; it is the built-in
  // replacement for lodash's _.extend, so the lodash dependency could be removed.
  // Assigning `password` goes through the schema's `password` virtual, which hashes it.
  const user = Object.assign(req.profile, changes, { updated: Date.now() })
  await user.save()
  res.json(user)
}

const remove = async (req, res) => {
  const user = req.profile
  // [BEGINNER] document.remove() was removed in Mongoose 7; deleteOne() is the replacement.
  await user.deleteOne()
  res.json(user)
}

export default {
  create,
  userByID,
  read,
  list,
  remove,
  update
}
