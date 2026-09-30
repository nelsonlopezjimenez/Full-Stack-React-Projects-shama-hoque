import User from '../models/user.model.js'
import _ from 'lodash'
import errorHandler from '../helpers/dbErrorHandler.js'

// [BEGINNER] Mongoose 7+ removed callbacks: user.save(cb) or User.find(cb) no longer work.
// Every query now returns a Promise, so the function is marked `async` and uses `await`.
// A try/catch replaces the old `if (err)` check inside the callback.
const create = async (req, res) => {
  const user = new User(req.body)
  try {
    await user.save()
    return res.status(200).json({
      message: "Successfully signed up!"
    })
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

/**
 * Load user and append to req.
 */
// [BEGINNER] A router.param callback has 4 parameters: (req, res, next, id).
// Express runs it before any route whose path contains :userId, so the handlers
// after it can simply read req.profile.
const userByID = async (req, res, next, id) => {
  try {
    const user = await User.findById(id)
    if (!user)
      // [BEGINNER] Status codes must be numbers. The book wrote res.status('400'); Express 5
      // throws "Invalid status code" for a string.
      return res.status(400).json({
        error: "User not found"
      })
    req.profile = user
    next()
  } catch (err) {
    return res.status(400).json({
      error: "Could not retrieve user"
    })
  }
}

const read = (req, res) => {
  req.profile.hashed_password = undefined
  req.profile.salt = undefined
  return res.json(req.profile)
}

const list = async (req, res) => {
  try {
    // [BEGINNER] .select() limits the fields returned, so passwords never leave the database here.
    const users = await User.find().select('name email updated created')
    res.json(users)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const update = async (req, res) => {
  try {
    let user = req.profile
    user = _.extend(user, req.body)
    user.updated = Date.now()
    await user.save()
    user.hashed_password = undefined
    user.salt = undefined
    res.json(user)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

const remove = async (req, res) => {
  try {
    const user = req.profile
    // [BEGINNER] document.remove() was removed in Mongoose 7; deleteOne() is the replacement.
    await user.deleteOne()
    user.hashed_password = undefined
    user.salt = undefined
    res.json(user)
  } catch (err) {
    return res.status(400).json({
      error: errorHandler.getErrorMessage(err)
    })
  }
}

export default {
  create,
  userByID,
  read,
  list,
  remove,
  update
}
