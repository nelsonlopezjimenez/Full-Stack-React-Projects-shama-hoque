import User from '../models/user.model.js'
import _ from 'lodash'
import errorHandler from './../helpers/dbErrorHandler.js'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const create = async (req, res, next) => {
  const user = new User(req.body)
  try {
    await user.save()
    return res.status(200).json({ message: 'Successfully signed up!' })
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) })
  }
}

const userByID = async (req, res, next, id) => {
  try {
    const user = await User.findById(id)
      .populate('following', '_id name')
      .populate('followers', '_id name')
    if (!user) return res.status(400).json({ error: 'User not found' })
    req.profile = user
    next()
  } catch (err) {
    return res.status(400).json({ error: 'User not found' })
  }
}

const read = (req, res) => {
  req.profile.hashed_password = undefined
  req.profile.salt = undefined
  return res.json(req.profile)
}

const list = async (req, res) => {
  try {
    const users = await User.find().select('name email updated created photo hashed_password')
    res.json(users)
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) })
  }
}

const update = (req, res, next) => {
  const form = new formidable.IncomingForm()
  form.keepExtensions = true
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: 'Photo could not be uploaded' })
    }
    let user = req.profile
    const normalizedFields = {}
    for (const [key, value] of Object.entries(fields)) {
      normalizedFields[key] = Array.isArray(value) ? value[0] : value
    }
    user = _.extend(user, normalizedFields)
    user.updated = Date.now()
    const photoFile = files.photo
      ? (Array.isArray(files.photo) ? files.photo[0] : files.photo)
      : null
    if (photoFile) {
      user.photo.data = fs.readFileSync(photoFile.filepath || photoFile.path)
      user.photo.contentType = photoFile.mimetype || photoFile.type
    }
    try {
      await user.save()
      user.hashed_password = undefined
      user.salt = undefined
      res.json(user)
    } catch (err) {
      return res.status(400).json({ error: errorHandler.getErrorMessage(err) })
    }
  })
}

const remove = async (req, res, next) => {
  try {
    const user = req.profile
    const deletedUser = await User.findByIdAndDelete(user._id)
    deletedUser.hashed_password = undefined
    deletedUser.salt = undefined
    res.json(deletedUser)
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) })
  }
}

const photo = (req, res, next) => {
  if (req.profile.photo.data) {
    res.set('Content-Type', req.profile.photo.contentType)
    return res.send(req.profile.photo.data)
  }
  next()
}

const defaultPhoto = (req, res) => {
  return res.sendFile(path.join(__dirname, '../../client/src/assets/images/profile-pic.png'))
}

const addFollowing = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.params.userId, { $push: { following: req.params.targetId } })
    next()
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) })
  }
}

const addFollower = async (req, res) => {
  try {
    const result = await User.findByIdAndUpdate(
      req.params.targetId,
      { $push: { followers: req.params.userId } },
      { new: true }
    )
      .populate('following', '_id name')
      .populate('followers', '_id name')
    result.hashed_password = undefined
    result.salt = undefined
    res.json(result)
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) })
  }
}

const removeFollowing = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.params.userId, { $pull: { following: req.params.targetId } })
    next()
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) })
  }
}

const removeFollower = async (req, res) => {
  try {
    const result = await User.findByIdAndUpdate(
      req.params.targetId,
      { $pull: { followers: req.params.userId } },
      { new: true }
    )
      .populate('following', '_id name')
      .populate('followers', '_id name')
    result.hashed_password = undefined
    result.salt = undefined
    res.json(result)
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) })
  }
}

const findPeople = async (req, res) => {
  try {
    const following = req.profile.following
    following.push(req.profile._id)
    const users = await User.find({ _id: { $nin: following } }).select('name')
    res.json(users)
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) })
  }
}

export default {
  create,
  userByID,
  read,
  list,
  remove,
  update,
  photo,
  defaultPhoto,
  addFollowing,
  addFollower,
  removeFollowing,
  removeFollower,
  findPeople
}
