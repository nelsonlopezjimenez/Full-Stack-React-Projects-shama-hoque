import express from 'express'
import userCtrl from '../controllers/user.controller.js'
import authCtrl from '../controllers/auth.controller.js'

const router = express.Router()

// [BEGINNER] router.route(path) groups every HTTP method for one URL, so the path is written once.
//
//   GET    /api/users            list users           (public)
//   POST   /api/users            sign up              (public)
//   GET    /api/users/:userId    read one user        (signed in)
//   PATCH  /api/users/:userId    update own profile   (signed in + owner)
//   DELETE /api/users/:userId    delete own account   (signed in + owner)
//
// [ADVANCED] These user routes were already RESTful in the book (plural noun, the id in the
// URL, the method as the verb). The Ch05 review flagged GET /api/users as public: anyone can
// list every name and email. Kept public here because the "Users" page is public in the
// client; add authCtrl.requireSignin in front of userCtrl.list to close it.
router.route('/api/users')
  .get(userCtrl.list)
  .post(userCtrl.create)

// [BEGINNER] Middleware runs left to right: requireSignin (is there a valid token?) →
// hasAuthorization (is it YOUR profile?) → the handler. Each one calls next() or answers.
//
// [ADVANCED] PATCH instead of the book's PUT (recommended in Ch05 docs/rest-routes.md §4):
// PUT means "replace the whole resource", PATCH means "change some fields". The client
// sends only the fields that change (e.g. just a new name), so PATCH is the honest verb.
router.route('/api/users/:userId')
  .get(authCtrl.requireSignin, userCtrl.read)
  .patch(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.update)
  .delete(authCtrl.requireSignin, authCtrl.hasAuthorization, userCtrl.remove)

// [BEGINNER] For every route above that contains :userId, Express first runs userByID,
// which loads the user into req.profile (see user.controller.js).
router.param('userId', userCtrl.userByID)

export default router
