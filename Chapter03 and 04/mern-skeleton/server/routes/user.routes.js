import express from 'express'
import userCtrl from '../controllers/user.controller.js'

// [BEGINNER] A Router is a mini-app that only holds routes. The main app plugs it in with
// app.use(), so all URL definitions for users live in this one file.
const router = express.Router()

// [BEGINNER] router.route(path) groups every HTTP method for one URL, so the path is written once.
//
//   GET    /api/users            list users
//   POST   /api/users            sign up
//   GET    /api/users/:userId    read one user
//   PATCH  /api/users/:userId    update a user
//   DELETE /api/users/:userId    delete a user
//
// [ADVANCED] PATCH instead of PUT: PUT means "replace the whole resource", PATCH means "change
// some fields". The client sends only the fields that change (e.g. just a new name), so PATCH
// is the honest verb.
router.route('/api/users')
  .get(userCtrl.list)
  .post(userCtrl.create)

router.route('/api/users/:userId')
  .get(userCtrl.read)
  .patch(userCtrl.update)
  .delete(userCtrl.remove)

export default router
