import express from 'express'
import authCtrl from '../controllers/auth.controller.js'

const router = express.Router()

// [BEGINNER] REST: the URL names a *thing* (a noun) and the HTTP method says what to do with it.
// Here the thing is a login session:
//   POST   /api/auth/sessions  → create a session  (sign in)
//   DELETE /api/auth/sessions  → end the session   (sign out)
//
// Book (RPC style, verbs in the URL):  POST /auth/signin   and   GET /auth/signout
// Why it changed (same decision as Ch05, see Chapter05/mern-social/DECISIONS.md §3):
//  1. GET must be "safe" (no side effects). Browsers prefetch links, and crawlers and proxies
//     can repeat a GET, so a GET that signs you out can be triggered by accident.
//  2. Every API route now starts with /api, so the Vite dev proxy and any reverse proxy need
//     only one rule ('/api'), and /auth/... can never clash with a client-side page URL.
//
// [ADVANCED] The book's RPC style was not "wrong": RPC is a real pattern (JSON-RPC, gRPC,
// GraphQL mutations). This is Richardson Maturity Level 1 → Level 2 (nouns + HTTP verbs).
// It is cheapest to change URLs now, before a mobile app or a third party depends on them.
// Another common naming is POST /api/auth/signin + POST /api/auth/signout; either is fine
// as long as signing out is not a GET.
router.route('/api/auth/sessions')
  .post(authCtrl.signin)
  .delete(authCtrl.signout)

export default router
