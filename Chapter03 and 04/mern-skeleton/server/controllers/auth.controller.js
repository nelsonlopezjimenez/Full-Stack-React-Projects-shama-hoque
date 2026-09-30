import User from '../models/user.model.js'
import jwt from 'jsonwebtoken'
import expressJwt from 'express-jwt'
import config from '../config/config.js'

const signin = (req, res) => {
  // [BEGINNER] Destructuring pulls two properties out of an object in one line.
  // `?? {}` (nullish coalescing) uses {} when req.body is null or undefined. In Express 5,
  // req.body stays undefined when no body parser ran (e.g. a request without a
  // Content-Type: application/json header), and reading `.email` of undefined would throw.
  const { email, password } = req.body ?? {}
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  User.findOne({ email }, (err, user) => {

    if (err || !user)
      return res.status(401).json({
        error: "User not found"
      })

    if (!user.authenticate(password)) {
      return res.status(401).send({
        error: "Email and password don't match."
      })
    }

    const token = jwt.sign({
      _id: user._id
    }, config.jwtSecret)

    res.cookie("t", token, {
      expire: new Date() + 9999
    })

    return res.json({
      token,
      user: {_id: user._id, name: user.name, email: user.email}
    })

  })
}

const signout = (req, res) => {
  res.clearCookie("t")
  return res.status(200).json({
    message: "signed out"
  })
}

const requireSignin = expressJwt({
  secret: config.jwtSecret,
  userProperty: 'auth'
})

const hasAuthorization = (req, res, next) => {
  const authorized = req.profile && req.auth && req.profile._id == req.auth._id
  if (!(authorized)) {
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
