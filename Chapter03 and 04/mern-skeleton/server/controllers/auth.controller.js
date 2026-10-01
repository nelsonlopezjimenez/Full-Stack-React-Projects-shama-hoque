import User from '../models/user.model.js'

const signin = async (req, res) => {
  const { email, password } = req.body ?? {}
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' })
  }

  const user = await User.findOne({ email })

  if (!user || user.password !== password) {
    return res.status(401).json({ error: "Email and password don't match." })
  }

  return res.json({
    user: { _id: user._id, name: user.name, email: user.email }
  })
}

export default {
  signin
}
