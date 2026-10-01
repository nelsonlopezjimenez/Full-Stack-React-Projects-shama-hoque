import User from '../models/user.model.js'

const create = async (req, res) => {
  const user = new User(req.body)
  await user.save()
  return res.status(201).json({
    message: "Successfully signed up!"
  })
}

const userByID = async (req, res, next) => {
  const user = await User.findById(req.params.userId)
  if (!user) {
    return res.status(404).json({ error: "User not found" })
  }
  req.profile = user
  next()
}

const read = (req, res) => {
  return res.json(req.profile)
}

const list = async (req, res) => {
  const users = await User.find().select('name email updated created')
  res.json(users)
}

const UPDATABLE_FIELDS = ['name', 'email', 'password']

const update = async (req, res) => {
  const body = req.body ?? {}
  const changes = Object.fromEntries(
    UPDATABLE_FIELDS
      .filter((field) => body[field] !== undefined)
      .map((field) => [field, body[field]])
  )
  const user = Object.assign(req.profile, changes, { updated: Date.now() })
  await user.save()
  res.json(user)
}

const remove = async (req, res) => {
  const user = req.profile
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
