import User from '../models/user.model.js'
import config from '../config/config.js'

const cookieOptions = {
  httpOnly: true,
  sameSite: 'strict',
  secure: config.env === 'production'
}

const ONE_DAY_MS = 24 * 60 * 60 * 1000

const signin = async (req, res) => {
  const { email, password } = req.body ?? {}
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  const user = await User.findOne({ email })

  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Email and password don't match." })
  }

  res.cookie('userId', user._id.toString(), { ...cookieOptions, maxAge: ONE_DAY_MS })

  return res.json({
    user: { _id: user._id, name: user.name, email: user.email }
  })
}

const signout = (req, res) => {
  res.clearCookie('userId', cookieOptions)
  return res.status(200).json({
    message: "signed out"
  })
}

const requireSignin = (req, res, next) => {
  const userId = req.cookies.userId
  if (!userId) {
    return res.status(401).json({ error: 'Please sign in' })
  }
  req.auth = { _id: userId }
  next()
}

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
