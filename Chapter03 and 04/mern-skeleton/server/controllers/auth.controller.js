import User from '../models/user.model.js'
import jwt from 'jsonwebtoken'
// [BEGINNER] Named import (curly braces): express-jwt v7+ exports `expressjwt` by name,
// the book's default import `import expressJwt from 'express-jwt'` no longer exists.
import { expressjwt } from 'express-jwt'
import config from '../config/config.js'

// [BEGINNER] A cookie is a small named value the server asks the browser to store. The browser
// then sends it back automatically with every request to this server.
// [ADVANCED] httpOnly: JavaScript in the page cannot read the cookie (limits XSS damage).
// sameSite 'strict': the browser does not send it on requests started by other sites (CSRF).
// secure: only sent over HTTPS — turned on in production only, because localhost is plain HTTP.
// The book passed { expire: new Date() + 9999 }: `expire` is not a cookie option (so it was
// ignored) and Date + number concatenates to a string. maxAge is in milliseconds.
const cookieOptions = {
  httpOnly: true,
  sameSite: 'strict',
  secure: config.env === 'production'
}

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

  // [BEGINNER] The token only contains the user id (never the password), signed with the
  // server's secret. Paste a token at https://jwt.io to see that the payload is readable,
  // only tamper-proof — so never put secrets in it.
  const token = jwt.sign({ _id: user._id }, config.jwtSecret, {
    algorithm: 'HS256',
    expiresIn: config.jwtExpiresIn // the book's tokens never expired
  })

  res.cookie('t', token, { ...cookieOptions, maxAge: config.jwtCookieMaxAgeMs })

  // [ADVANCED] The token is sent twice: in the httpOnly cookie and in the body. A browser app
  // needs only the cookie (requireSignin reads it first). The body copy is for clients that
  // cannot use cookies, such as a mobile app or another server: they send it back as
  // "Authorization: Bearer <token>". (The React client of refactor/ch03-migration does that.)
  return res.json({
    token,
    user: { _id: user._id, name: user.name, email: user.email }
  })
}

const signout = (req, res) => {
  // [BEGINNER] A cookie is only removed when the same options (path, sameSite, secure) are given.
  res.clearCookie('t', cookieOptions)
  return res.status(200).json({
    message: "signed out"
  })
}

// [BEGINNER] Where requireSignin looks for the token: the httpOnly cookie "t" first, then an
// "Authorization: Bearer <token>" header. Returning undefined means "no token".
// `?.` (optional chaining) stops at a missing value instead of throwing: if there is no
// Authorization header, req.headers.authorization?.split(' ') is undefined.
const getToken = (req) => {
  if (req.cookies?.t) return req.cookies.t
  const [scheme, token] = req.headers.authorization?.split(' ') ?? []
  if (scheme === 'Bearer') return token
}

// [BEGINNER] requireSignin is middleware: it finds the token (getToken), verifies the signature
// and the expiry, and puts the decoded payload in req.auth. If the token is missing or
// invalid it calls next(err) with an UnauthorizedError (→ 401 in express.js).
// [ADVANCED] `algorithms` is required since express-jwt v6: without an allow-list an attacker
// could send a token signed with a different algorithm (the "alg: none" family of attacks).
// `requestProperty` replaced the book's `userProperty` (its default is already 'auth').
// The book (and refactor/ch03-migration) read only the Authorization header and set the cookie
// without ever using it.
const requireSignin = expressjwt({
  secret: config.jwtSecret,
  algorithms: ['HS256'],
  requestProperty: 'auth',
  getToken
})

// [BEGINNER] Authentication = WHO are you (requireSignin). Authorization = are you ALLOWED to do
// this (hasAuthorization). Being signed in as Ann does not allow changing Bob's account.
const hasAuthorization = (req, res, next) => {
  // [BEGINNER] req.profile._id is an ObjectId and req.auth._id is a string (from the JWT).
  // Comparing them with `===` would always be false (different types). .equals() compares
  // ObjectIds explicitly and also accepts a hex string.
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
