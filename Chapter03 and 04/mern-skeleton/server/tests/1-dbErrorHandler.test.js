import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import dbErrorHandler from '../helpers/dbErrorHandler.js'

describe('dbErrorHandler.getErrorMessage', () => {
  it('names the field of a duplicate key error (MongoDB 4.2+ format)', () => {
    const err = {
      code: 11000,
      keyValue: { email: 'ann@test.io' },
      message: 'E11000 duplicate key error collection: mernskeleton.users index: email_1 dup key: { email: "ann@test.io" }'
    }
    assert.equal(dbErrorHandler.getErrorMessage(err), 'Email already exists')
  })

  it('falls back to a generic text when keyValue is missing', () => {
    assert.equal(dbErrorHandler.getErrorMessage({ code: 11000 }), 'Unique field already exists')
  })

  it('returns EVERY validation message, not only the last one', () => {
    const err = {
      name: 'ValidationError',
      errors: {
        name: { message: 'Name is required.' },
        email: { message: 'Email is required.' }
      }
    }
    assert.equal(dbErrorHandler.getErrorMessage(err), 'Name is required. Email is required.')
  })

  it('hides unknown errors behind a generic message', () => {
    assert.equal(dbErrorHandler.getErrorMessage(new Error('socket hang up')), 'Something went wrong')
  })
})
