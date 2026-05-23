/**
 * LEVEL 3 — Client utility with browser APIs (sessionStorage)
 *
 * NOTE (main branch): source files are at client/*.jsx (not client/src/*.jsx).
 * Paths from client/__tests__/ → ../auth/auth-helper, ../auth/api-auth.jsx
 *
 * vi.mock()      — replace a module with a stub (no real HTTP requests)
 * sessionStorage — available because vite.config.js sets environment: 'jsdom'
 * vi.fn()        — spy function: records calls, returns configured values
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

vi.mock('../auth/api-auth.jsx', () => ({
  signout: vi.fn().mockResolvedValue({ message: 'signed out' }),
}))

import auth from '../auth/auth-helper'

const fakeJwt = { token: 'abc123', user: { _id: 'u1', name: 'Alice', email: 'a@test.com' } }

describe('auth-helper', () => {
  beforeEach(() => {
    sessionStorage.clear()
  })

  describe('isAuthenticated()', () => {
    it('returns false when nothing is stored', () => {
      expect(auth.isAuthenticated()).toBe(false)
    })

    it('returns the stored JWT object after authenticate()', () => {
      auth.authenticate(fakeJwt, () => {})
      expect(auth.isAuthenticated()).toEqual(fakeJwt)
    })
  })

  describe('authenticate()', () => {
    it('stores the JWT in sessionStorage', () => {
      auth.authenticate(fakeJwt, () => {})
      const stored = JSON.parse(sessionStorage.getItem('jwt'))
      expect(stored).toEqual(fakeJwt)
    })

    it('calls the callback', () => {
      const cb = vi.fn()
      auth.authenticate(fakeJwt, cb)
      expect(cb).toHaveBeenCalledOnce()
    })
  })

  describe('signout()', () => {
    it('removes the JWT from sessionStorage', () => {
      auth.authenticate(fakeJwt, () => {})
      auth.signout(() => {})
      expect(sessionStorage.getItem('jwt')).toBeNull()
    })

    it('calls the callback', () => {
      const cb = vi.fn()
      auth.signout(cb)
      expect(cb).toHaveBeenCalledOnce()
    })

    it('returns false from isAuthenticated after signout', () => {
      auth.authenticate(fakeJwt, () => {})
      auth.signout(() => {})
      expect(auth.isAuthenticated()).toBe(false)
    })
  })
})
