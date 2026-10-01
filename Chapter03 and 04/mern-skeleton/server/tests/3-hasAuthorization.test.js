import { describe, it, mock } from 'node:test'
import assert from 'node:assert/strict'
import mongoose from 'mongoose'
import authCtrl from '../controllers/auth.controller.js'

const fakeRes = () => ({
  statusCode: 200,
  body: undefined,
  status(code) { this.statusCode = code; return this },
  json(body) { this.body = body; return this }
})

describe('authCtrl.hasAuthorization', () => {
  const id = new mongoose.Types.ObjectId()

  it('calls next() when the token belongs to the profile owner', () => {
    const req = { profile: { _id: id }, auth: { _id: id.toString() } }
    const res = fakeRes()
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
