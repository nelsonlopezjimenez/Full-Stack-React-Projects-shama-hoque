import User from '../models/user.model.js'
import config from '../config/config.js'

// [BEGINNER] A cookie is a small named value the server asks the browser to store. The browser
// then sends it back automatically with every request to this server, so the server can
// recognise who is asking without a new sign-in each time.
// [ADVANCED] httpOnly: JavaScript in the page cannot read the cookie (limits XSS damage).
// sameSite 'strict': the browser does not send it on requests started by other sites (CSRF).
// secure: only sent over HTTPS — turned on in production only, because localhost is plain HTTP.
const cookieOptions = {
  httpOnly: true,
  sameSite: 'strict',
  secure: config.env === 'production'
}

// [BEGINNER] How long the browser keeps the cookie, in milliseconds: 1 day.
const ONE_DAY_MS = 24 * 60 * 60 * 1000

const signin = async (req, res) => {
  // [BEGINNER] Destructuring pulls two properties out of an object in one line.
  // `?? {}` (nullish coalescing) uses {} when req.body is null or undefined. In Express 5,
  // req.body stays undefined when no body parser ran (e.g. a request without a
  // Content-Type: application/json header), and reading `.email` of undefined would throw.
  const { email, password } = req.body ?? {}
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  // [BEGINNER] `{ email }` is shorthand for `{ email: email }`.
  // No try/catch: a database error rejects the Promise and Express 5 sends it to the
  // error handler in express.js (a 500, instead of pretending it was a wrong password).
  const user = await User.findOne({ email })

  // [BEGINNER] TEACHING VERSION: the stored password is plain text, so checking it is a
  // simple comparison. (Stage 14 stores a hash and compares hashes instead.)
  // `!user ||` comes first: when no user has this email there is nothing to compare.
  // [ADVANCED] One message for "no such email" and "wrong password". Answering "User not found"
  // for the first case would let anyone test which emails have an account
  // (account enumeration).
  if (!user || user.password !== password) {
    // [BEGINNER] 401 Unauthorized: "I don't know who you are" (here: the proof was wrong).
    return res.status(401).json({ error: "Email and password don't match." })
  }

  // [BEGINNER] TEACHING VERSION: the cookie simply contains the user's id. Every later request
  // carries it, and requireSignin (below) believes it. Believes it a bit too much:
  // see the lesson, and stage 12.
  res.cookie('userId', user._id.toString(), { ...cookieOptions, maxAge: ONE_DAY_MS })

  return res.json({
    user: { _id: user._id, name: user.name, email: user.email }
  })
}

const signout = (req, res) => {
  // [BEGINNER] A cookie is only removed when the same options (path, sameSite, secure) are given.
  res.clearCookie('userId', cookieOptions)
  return res.status(200).json({
    message: "signed out"
  })
}

// [BEGINNER] requireSignin is middleware: it lets the request continue only if it carries the
// sign-in cookie, and records WHO is asking in req.auth for the functions after it.
// cookie-parser (express.js) has already turned the Cookie header into the object req.cookies.
const requireSignin = (req, res, next) => {
  const userId = req.cookies.userId
  if (!userId) {
    return res.status(401).json({ error: 'Please sign in' })
  }
  req.auth = { _id: userId }
  next()
}

// [BEGINNER] Authentication = WHO are you (requireSignin). Authorization = are you ALLOWED to do
// this (hasAuthorization). Being signed in as Ann does not allow changing Bob's account.
const hasAuthorization = (req, res, next) => {
  // [BEGINNER] req.profile._id is an ObjectId and req.auth._id is a string. Comparing them with
  // `===` would always be false (different types). .equals() compares ObjectIds explicitly
  // and also accepts a hex string.
  const authorized = req.profile && req.auth && req.profile._id.equals(req.auth._id)
  if (!authorized) {
    // [BEGINNER] 403 Forbidden: "I know who you are, and the answer is no".
    return res.status(403).json({
      error: "User is not authorized"
    })
  }
  next()
}

export default {
  signin,
  signout,
  requireSignin,
  hasAuthorization
}
