/**
 * LEVEL 1 — Pure function test (no database, no network, no mocks needed)
 *
 * describe()  — groups related tests under a label
 * it()        — a single test case
 * expect()    — assertion entry point
 * .toBe()     — strict equality (===)
 * .toContain()— checks a string includes a substring
 */

import { describe, it, expect } from 'vitest'
import dbErrorHandler from '../../helpers/dbErrorHandler.js'

const { getErrorMessage } = dbErrorHandler

// ─── duplicate key (MongoDB error code 11000) ───────────────────────────────
describe('getErrorMessage — duplicate key errors', () => {
  it('extracts the field name from the error message', () => {
    const err = {
      code: 11000,
      // Parser looks for ".$fieldName_1" pattern (older MongoDB message format)
      message: 'E11000 duplicate key error index: test.users.$email_1 dup key: {}',
    }
    const result = getErrorMessage(err)
    expect(result).toContain('Email')
    expect(result).toContain('already exists')
  })

  it('handles code 11001 the same way', () => {
    const err = {
      code: 11001,
      message: 'E11001 duplicate key error index: test.users.$email_1 dup key: {}',
    }
    expect(getErrorMessage(err)).toContain('already exists')
  })

  it('falls back gracefully when the message is missing entirely', () => {
    // undefined.lastIndexOf() throws TypeError → catch block returns safe fallback
    const err = { code: 11000, message: undefined }
    expect(getErrorMessage(err)).toBe('Unique field already exists')
  })
})

// ─── Mongoose validation errors ──────────────────────────────────────────────
describe('getErrorMessage — validation errors', () => {
  it('returns the message from the first failing validator', () => {
    const err = {
      errors: { name: { message: 'Name is required' } },
    }
    expect(getErrorMessage(err)).toBe('Name is required')
  })

  it('returns a non-empty string when multiple fields fail', () => {
    const err = {
      errors: {
        name:  { message: 'Name is required' },
        email: { message: 'Email is required' },
      },
    }
    expect(getErrorMessage(err)).toBeTruthy()
  })
})

// ─── other errors ─────────────────────────────────────────────────────────────
describe('getErrorMessage — other cases', () => {
  it('returns "Something went wrong" for an unrecognised error code', () => {
    const err = { code: 999, message: 'something' }
    expect(getErrorMessage(err)).toBe('Something went wrong')
  })

  it('returns an empty string when there are no errors at all', () => {
    expect(getErrorMessage({})).toBe('')
  })
})
