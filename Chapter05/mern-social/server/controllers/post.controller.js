import Post from '../models/post.model.js'
import _ from 'lodash'
import errorHandler from './../helpers/dbErrorHandler.js'
import formidable from 'formidable'
import fs from 'fs'

const create = (req, res, next) => {
  const form = new formidable.IncomingForm()
  form.keepExtensions = true
  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res.status(400).json({ error: 'Image could not be uploaded' })
    }
    const normalizedFields = {}
    for (const [key, value] of Object.entries(fields)) {
      normalizedFields[key] = Array.isArray(value) ? value[0] : value
    }
    const post = new Post(normalizedFields)
    post.postedBy = req.profile
    const photoFile = files.photo
      ? (Array.isArray(files.photo) ? files.photo[0] : files.photo)
      : null
    if (photoFile) {
      post.photo.data = fs.readFileSync(photoFile.filepath || photoFile.path)
      post.photo.contentType = photoFile.mimetype || photoFile.type
    }
    try {
      const result = await post.save()
      res.json(result)
    } catch (err) {
      return res.status(400).json({ error: errorHandler.getErrorMessage(err) })
    }
  })
}

const postByID = async (req, res, next, id) => {
  try {
    const post = await Post.findById(id).populate('postedBy', '_id name')
    if (!post) return res.status(400).json({ error: 'Post not found' })
    req.post = post
    next()
  } catch (err) {
    return res.status(400).json({ error: 'Post not found' })
  }
}

const listByUser = async (req, res) => {
  try {
    const posts = await Post.find({ postedBy: req.profile._id })
      .populate('comments', 'text created')
      .populate('comments.postedBy', '_id name')
      .populate('postedBy', '_id name')
      .sort('-created')
    res.json(posts)
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) })
  }
}

const listNewsFeed = async (req, res) => {
  const following = req.profile.following.map(f => f._id)
  following.push(req.profile._id)
  try {
    const posts = await Post.find({ postedBy: { $in: following } })
      .populate('comments', 'text created')
      .populate('comments.postedBy', '_id name')
      .populate('postedBy', '_id name')
      .sort('-created')
    res.json(posts)
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) })
  }
}

const remove = async (req, res) => {
  try {
    const deletedPost = await Post.findByIdAndDelete(req.post._id)
    res.json(deletedPost)
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) })
  }
}

const photo = (req, res, next) => {
  res.set('Content-Type', req.post.photo.contentType)
  return res.send(req.post.photo.data)
}

const like = async (req, res) => {
  try {
    const result = await Post.findByIdAndUpdate(
      req.body.postId,
      { $push: { likes: req.body.userId } },
      { new: true }
    )
    res.json(result)
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) })
  }
}

const unlike = async (req, res) => {
  try {
    const result = await Post.findByIdAndUpdate(
      req.body.postId,
      { $pull: { likes: req.body.userId } },
      { new: true }
    )
    res.json(result)
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) })
  }
}

const comment = async (req, res) => {
  const commentData = req.body.comment
  commentData.postedBy = req.body.userId
  try {
    const result = await Post.findByIdAndUpdate(
      req.body.postId,
      { $push: { comments: commentData } },
      { new: true }
    )
      .populate('comments.postedBy', '_id name')
      .populate('postedBy', '_id name')
    res.json(result)
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) })
  }
}

const uncomment = async (req, res) => {
  const commentData = req.body.comment
  try {
    const result = await Post.findByIdAndUpdate(
      req.body.postId,
      { $pull: { comments: { _id: commentData._id } } },
      { new: true }
    )
      .populate('comments.postedBy', '_id name')
      .populate('postedBy', '_id name')
    res.json(result)
  } catch (err) {
    return res.status(400).json({ error: errorHandler.getErrorMessage(err) })
  }
}

const isPoster = (req, res, next) => {
  const isPoster = req.post && req.auth && req.post.postedBy._id == req.auth._id
  if (!isPoster) {
    return res.status(403).json({ error: 'User is not authorized' })
  }
  next()
}

export default {
  listByUser,
  listNewsFeed,
  create,
  postByID,
  remove,
  photo,
  like,
  unlike,
  comment,
  uncomment,
  isPoster
}
