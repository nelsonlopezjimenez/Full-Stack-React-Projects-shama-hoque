import User from '../models/user.model.js'

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

  // [BEGINNER] Only the public fields go back. The server does not remember the sign-in yet:
  // the next request is anonymous again. Stage 10 fixes that with a cookie.
  return res.json({
    user: { _id: user._id, name: user.name, email: user.email }
  })
}

export default {
  signin
}
