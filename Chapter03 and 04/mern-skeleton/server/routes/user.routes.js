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

// [BEGINNER] Middleware runs left to right, and each one either calls next() or answers:
//   requireSignin     is there a valid token?          (no → 401)
//   userByID          load the user into req.profile   (no such user → 404)
//   hasAuthorization  is it YOUR profile?              (no → 403)
//   read/update/remove
//
// [ADVANCED] The book used router.param('userId', userCtrl.userByID) instead of listing
// userByID here. router.param callbacks run BEFORE requireSignin (checked on Express 5), so
// unauthenticated requests hit the database and could tell which ids exist (404 vs 401).
// Details in user.controller.js. Trade-off from the Ch05 discussion (docs/rest-routes.md):
// loading the document costs one query per request; it is worth it here because
// hasAuthorization needs req.profile before update/delete are allowed.
//
// [ADVANCED] PATCH instead of the book's PUT (recommended in Ch05 docs/rest-routes.md §4):
// PUT means "replace the whole resource", PATCH means "change some fields". The client
// sends only the fields that change (e.g. just a new name), so PATCH is the honest verb.
router.route('/api/users/:userId')
  .get(authCtrl.requireSignin, userCtrl.userByID, userCtrl.read)
  .patch(authCtrl.requireSignin, userCtrl.userByID, authCtrl.hasAuthorization, userCtrl.update)
  .delete(authCtrl.requireSignin, userCtrl.userByID, authCtrl.hasAuthorization, userCtrl.remove)

export default router
