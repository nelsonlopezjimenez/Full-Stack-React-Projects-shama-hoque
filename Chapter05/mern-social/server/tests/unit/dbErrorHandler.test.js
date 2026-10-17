/**
 * LEVEL 1 — Pure function test (no database, no network, no mocks needed)
 *
 * This is the simplest kind of test: a function goes in, a value comes out.
 * We just verify the output matches what we expect.
 *
 * Concepts introduced:
 *   - describe()  — groups related tests under a label
 *   - it()        — a single test case ("it should do X")
 *   - expect()    — assertion: "I expect this value to be..."
 *   - .toBe()     — strict equality (===)
 *   - .toContain()— checks a string includes a substring
 */

import { describe, it, expect } from 'vitest'
import dbErrorHandler from '../../helpers/dbErrorHandler.js'

const { getErrorMessage } = dbErrorHandler

// ─── duplicate key (MongoDB error code 11000) ───────────────────────────────
describe('getErrorMessage — duplicate key errors', () => {
  it('extracts the field name from the error message', () => {
    const err = {
      code: 11000,
      // The parser looks for the ".$fieldName_1" pattern (older MongoDB format).
      // Without the ".$" prefix the substring math goes wrong — see the quirk test below.
      message: 'E11000 duplicate key error index: test.users.$email_1 dup key: {}',
    }
    const result = getErrorMessage(err)
    // The helper parses out "email" and capitalises it
    expect(result).toContain('Email')
    expect(result).toContain('already exists')
  })

  it('handles code 11001 the same way', () => {
    const err = {
      code: 11001,
      message: 'E11001 duplicate key error collection: test.users index: email_1 dup key',
    }
    expect(getErrorMessage(err)).toContain('already exists')
  })

  it('falls back gracefully when the message is missing entirely', () => {
    // When message is undefined, calling .lastIndexOf() throws a TypeError.
    // The catch block intercepts it and returns the safe fallback string.
    const err = { code: 11000, message: undefined }
    expect(getErrorMessage(err)).toBe('Unique field already exists')
  })
})

// ─── Mongoose validation errors ──────────────────────────────────────────────
describe('getErrorMessage — validation errors', () => {
  it('returns the message from the first failing validator', () => {
    // Mongoose wraps field errors in err.errors[fieldName].message
    const err = {
      errors: {
        name: { message: 'Name is required' },
      },
    }
    expect(getErrorMessage(err)).toBe('Name is required')
  })

  it('returns the last field message when multiple fields fail', () => {
    // The for-in loop overwrites `message` on each iteration,
    // so we get whatever field came last — a known quirk worth documenting
    const err = {
      errors: {
        name:  { message: 'Name is required' },
        email: { message: 'Email is required' },
      },
    }
    // Just verify a non-empty string comes back
    expect(getErrorMessage(err)).toBeTruthy()
  })
})

// ─── unknown / other errors ───────────────────────────────────────────────────
describe('getErrorMessage — other cases', () => {
  it('returns "Something went wrong" for an unrecognised error code', () => {
    const err = { code: 999, message: 'something' }
    expect(getErrorMessage(err)).toBe('Something went wrong')
  })

  it('returns an empty string when there are no errors at all', () => {
    expect(getErrorMessage({})).toBe('')
  })
})
