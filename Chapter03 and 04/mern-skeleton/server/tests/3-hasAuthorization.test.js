// Level 3 — one middleware in isolation, with fake req/res objects and a mock `next`.
import { describe, it, mock } from 'node:test'
import assert from 'node:assert/strict'
import mongoose from 'mongoose'
import authCtrl from '../controllers/auth.controller.js'

// [BEGINNER] A minimal stand-in for Express's `res`: status() returns `this` so that
// res.status(403).json(...) can be chained, just like the real object.
const fakeRes = () => ({
  statusCode: 200,
  body: undefined,
  status(code) { this.statusCode = code; return this },
  json(body) { this.body = body; return this }
})

describe('authCtrl.hasAuthorization', () => {
  const id = new mongoose.Types.ObjectId()

  it('calls next() when the token belongs to the profile owner', () => {
    // req.profile._id is an ObjectId (from Mongoose), req.auth._id a string (from the JWT)
    const req = { profile: { _id: id }, auth: { _id: id.toString() } }
    const res = fakeRes()
    // [BEGINNER] mock.fn() records every call, so we can check that next() ran exactly once.
    const next = mock.fn()
    authCtrl.hasAuthorization(req, res, next)
    assert.equal(next.mock.callCount(), 1)
  })

  it('answers 403 for somebody else\'s profile', () => {
    const req = { profile: { _id: id }, auth: { _id: new mongoose.Types.ObjectId().toString() } }
    const res = fakeRes()
    const next = mock.fn()
    authCtrl.hasAuthorization(req, res, next)
    assert.equal(next.mock.callCount(), 0)
    assert.equal(res.statusCode, 403)
    assert.deepEqual(res.body, { error: 'User is not authorized' })
  })
})
