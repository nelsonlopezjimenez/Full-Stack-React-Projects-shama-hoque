import express from 'express'
import userCtrl from '../controllers/user.controller.js'
import authCtrl from '../controllers/auth.controller.js'
import postCtrl from '../controllers/post.controller.js'

const router = express.Router()

// User-post sub-resources
router.route('/api/users/:userId/posts')
  .post(authCtrl.requireSignin, postCtrl.create)
  .get(authCtrl.requireSignin, postCtrl.listByUser)

router.route('/api/users/:userId/feed')
  .get(authCtrl.requireSignin, postCtrl.listNewsFeed)

// Post resources
router.route('/api/posts/:postId')
  .delete(authCtrl.requireSignin, postCtrl.isPoster, postCtrl.remove)

router.route('/api/posts/:postId/photo')
  .get(postCtrl.photo)

router.route('/api/posts/:postId/likes')
  .post(authCtrl.requireSignin, postCtrl.like)
  .delete(authCtrl.requireSignin, postCtrl.unlike)

router.route('/api/posts/:postId/comments')
  .post(authCtrl.requireSignin, postCtrl.comment)

router.route('/api/posts/:postId/comments/:commentId')
  .delete(authCtrl.requireSignin, postCtrl.uncomment)

router.param('userId', userCtrl.userByID)
router.param('postId', postCtrl.postByID)

export default router
