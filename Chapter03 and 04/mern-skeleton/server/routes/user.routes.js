import express from 'express'
import userCtrl from '../controllers/user.controller.js'
import authCtrl from '../controllers/auth.controller.js'

// [BEGINNER] A Router is a mini-app that only holds routes. The main app plugs it in with
// app.use(), so all URL definitions for users live in this one file.
const router = express.Router()

// [BEGINNER] router.route(path) groups every HTTP method for one URL, so the path is written once.
//
//   GET    /api/users            list users           (public)
//   POST   /api/users            sign up              (public)
//   GET    /api/users/:userId    read one user        (signed in)
//   PATCH  /api/users/:userId    update own profile   (signed in + owner)
//   DELETE /api/users/:userId    delete own account   (signed in + owner)
//
// [ADVANCED] GET /api/users is public: anyone can list every name and email. Kept public
// because the "Users" page of the React client is public; add authCtrl.requireSignin in front
// of userCtrl.list to close it.
//
// [ADVANCED] PATCH instead of PUT: PUT means "replace the whole resource", PATCH means "change
// some fields". The client sends only the fields that change (e.g. just a new name), so PATCH
// is the honest verb.
router.route('/api/users')
  .get(userCtrl.list)
  .post(userCtrl.create)

// [BEGINNER] A route can list SEVERAL functions. Express runs them left to right; each one
// either answers or calls next() to hand the request to the next one:
//   requireSignin     is the sign-in cookie there?     (no → 401)
//   userByID          load the user into req.profile   (no such user → 404)
//   hasAuthorization  is it YOUR profile?              (no → 403)
//   read/update/remove
//
// [ADVANCED] The book used router.param('userId', userCtrl.userByID) instead of listing
// userByID here. router.param callbacks run BEFORE requireSignin (checked on Express 5), so
// requests without a sign-in hit the database and could tell which ids exist (404 vs 401).
// Listing userByID after requireSignin makes the order visible and fixes both.
router.route('/api/users/:userId')
  .get(authCtrl.requireSignin, userCtrl.userByID, userCtrl.read)
  .patch(authCtrl.requireSignin, userCtrl.userByID, authCtrl.hasAuthorization, userCtrl.update)
  .delete(authCtrl.requireSignin, userCtrl.userByID, authCtrl.hasAuthorization, userCtrl.remove)

export default router
