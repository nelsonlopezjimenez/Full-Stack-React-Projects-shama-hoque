import User from '../models/user.model.js'
import jwt from 'jsonwebtoken'
import { expressjwt } from 'express-jwt'
import config from '../config/config.js'

const cookieOptions = {
  httpOnly: true,
  sameSite: 'strict',
  secure: config.env === 'production'
}

const signin = async (req, res) => {
  const { email, password } = req.body ?? {}
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  const user = await User.findOne({ email })

  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Email and password don't match." })
  }

  const token = jwt.sign({ _id: user._id }, config.jwtSecret, {
    algorithm: 'HS256',
    expiresIn: config.jwtExpiresIn
  })

  res.cookie('t', token, { ...cookieOptions, maxAge: config.jwtCookieMaxAgeMs })

  return res.json({
    token,
    user: { _id: user._id, name: user.name, email: user.email }
  })
}

const signout = (req, res) => {
  res.clearCookie('t', cookieOptions)
  return res.status(200).json({
    message: "signed out"
  })
}

const getToken = (req) => {
  if (req.cookies?.t) return req.cookies.t
  const [scheme, token] = req.headers.authorization?.split(' ') ?? []
  if (scheme === 'Bearer') return token
}

const requireSignin = expressjwt({
  secret: config.jwtSecret,
  algorithms: ['HS256'],
  requestProperty: 'auth',
  getToken
})

const hasAuthorization = (req, res, next) => {
  const authorized = req.profile && req.auth && req.profile._id.equals(req.auth._id)
  if (!authorized) {
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
