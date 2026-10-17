/**
 * LEVEL 3 — Client utility with browser APIs (sessionStorage)
 *
 * The jsdom test environment simulates a browser inside Node.js.
 * sessionStorage, window, and document are all available.
 *
 * New concepts:
 *   - vi.mock()          — replace a module with a fake version
 *   - beforeEach()       — clear state between tests so they don't bleed into each other
 *   - sessionStorage     — browser key/value store (available in jsdom)
 *   - expect().toEqual() — deep equality (useful for objects)
 *   - expect().toBe()    — strict equality (=== for primitives)
 *   - expect().toBeFalsy()/ toTruthy() — boolean-ish check
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'

// auth-helper calls signout() from api-auth when the user signs out.
// We replace api-auth with a stub so the test does not make real HTTP requests.
vi.mock('../auth/api-auth.jsx', () => ({
  signout: vi.fn().mockResolvedValue({ message: 'signed out' }),
}))

// Import AFTER the mock is declared — Vitest hoists vi.mock() automatically
import auth from '../auth/auth-helper'

// ─── helpers ─────────────────────────────────────────────────────────────────
const fakeJwt = { token: 'abc123', user: { _id: 'u1', name: 'Alice', email: 'a@test.com' } }

describe('auth-helper', () => {
  beforeEach(() => {
    // Start every test with a clean sessionStorage
    sessionStorage.clear()
  })

  // ── isAuthenticated ─────────────────────────────────────────────────────────
  describe('isAuthenticated()', () => {
    it('returns false when nothing is stored', () => {
      expect(auth.isAuthenticated()).toBe(false)
    })

    it('returns the stored JWT object after authenticate()', () => {
      auth.authenticate(fakeJwt, () => {})
      const result = auth.isAuthenticated()
      // toEqual does a deep comparison — both objects have the same shape/values
      expect(result).toEqual(fakeJwt)
    })
  })

  // ── authenticate ───────────────────────────────────────────────────────────
  describe('authenticate()', () => {
    it('stores the JWT in sessionStorage', () => {
      auth.authenticate(fakeJwt, () => {})
      const stored = JSON.parse(sessionStorage.getItem('jwt'))
      expect(stored).toEqual(fakeJwt)
    })

    it('calls the callback', () => {
      const cb = vi.fn() // vi.fn() creates a spy function we can inspect
      auth.authenticate(fakeJwt, cb)
      expect(cb).toHaveBeenCalledOnce()
    })
  })

  // ── signout ────────────────────────────────────────────────────────────────
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
