import express from 'express'
import userCtrl from '../controllers/user.controller.js'

const router = express.Router()

router.route('/api/users')
  .get(userCtrl.list)
  .post(userCtrl.create)

router.route('/api/users/:userId')
  .get(userCtrl.userByID, userCtrl.read)
  .patch(userCtrl.userByID, userCtrl.update)
  .delete(userCtrl.userByID, userCtrl.remove)

export default router
