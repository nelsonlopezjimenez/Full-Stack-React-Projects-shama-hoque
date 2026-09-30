import User from '../models/user.model.js'
import _ from 'lodash'

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
// [BEGINNER] A router.param callback has 4 parameters: (req, res, next, id).
// Express runs it before any route whose path contains :userId, so the handlers
// after it can simply read req.profile.
// Execution order for GET /api/users/:userId → requireSignin → userByID → read.
//
// [ADVANCED] Trade-off from the Ch05 routing discussion (docs/rest-routes.md): router.param
// costs one DB query on every :userId route. Here that query is worth it, because
// hasAuthorization compares req.profile with the token before update/delete are allowed.
const userByID = async (req, res, next, id) => {
  // An id that is not a valid ObjectId throws a CastError → 400 in the error handler.
  const user = await User.findById(id)
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

const update = async (req, res) => {
  let user = req.profile
  user = _.extend(user, req.body)
  user.updated = Date.now()
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
