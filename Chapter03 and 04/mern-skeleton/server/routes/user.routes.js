import express from 'express'
import userCtrl from '../controllers/user.controller.js'
import authCtrl from '../controllers/auth.controller.js'

const router = express.Router()

router.route('/api/users')
  .get(userCtrl.list)
  .post(userCtrl.create)

router.route('/api/users/:userId')
  .get(authCtrl.requireSignin, userCtrl.userByID, userCtrl.read)
  .patch(authCtrl.requireSignin, userCtrl.userByID, userCtrl.update)
  .delete(authCtrl.requireSignin, userCtrl.userByID, userCtrl.remove)

export default router
