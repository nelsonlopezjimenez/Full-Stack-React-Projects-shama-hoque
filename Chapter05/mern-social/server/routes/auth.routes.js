import express from 'express'
import authCtrl from '../controllers/auth.controller.js'

const router = express.Router()

router.route('/api/auth/sessions')
  .post(authCtrl.signin)
  .delete(authCtrl.signout)

export default router
