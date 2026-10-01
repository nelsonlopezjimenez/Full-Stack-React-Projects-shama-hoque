import express from 'express'
import authCtrl from '../controllers/auth.controller.js'

const router = express.Router()

// [BEGINNER] REST: the URL names a *thing* (a noun) and the HTTP method says what to do with it.
// Here the thing is a login session:
//   POST   /api/auth/sessions  → create a session  (sign in)
//
// [ADVANCED] The book used RPC style, verbs in the URL: POST /auth/signin and GET /auth/signout.
// RPC is a real pattern too (JSON-RPC, gRPC), but with nouns + HTTP verbs every API route starts
// with /api, and signing out (stage 10) can never be a GET, which browsers may prefetch.
// Another common naming is POST /api/auth/signin + POST /api/auth/signout; either is fine
// as long as signing out is not a GET.
router.route('/api/auth/sessions')
  .post(authCtrl.signin)

export default router
