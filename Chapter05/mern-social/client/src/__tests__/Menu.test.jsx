/**
 * LEVEL 4 — React component test
 *
 * We render a real component, interact with it, and assert on what appears
 * in the DOM.  No browser needed — jsdom provides the DOM layer.
 *
 * New concepts:
 *   - render()           — mounts a component into the jsdom DOM
 *   - screen             — queries the rendered DOM (getByText, queryByText, …)
 *   - MemoryRouter       — provides router context without a real browser URL bar
 *   - vi.mock()          — swap auth-helper with a controllable fake
 *   - mockReturnValue()  — tell the mock what to return for this test
 *   - getByText()        — assert the element EXISTS (throws if not found)
 *   - queryByText()      — returns null if not found (use for "should NOT exist")
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

// Replace auth-helper so we control what isAuthenticated() returns
vi.mock('../auth/auth-helper', () => ({
  default: {
    isAuthenticated: vi.fn(),
    signout: vi.fn(),
  },
}))

// Replace api-auth so signout() doesn't try to fetch
vi.mock('../auth/api-auth.jsx', () => ({
  signout: vi.fn().mockResolvedValue({}),
}))

import Menu from '../core/Menu'
import auth from '../auth/auth-helper'

// Helper: render Menu inside MemoryRouter at a given path
const renderMenu = (path = '/') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Menu />
    </MemoryRouter>
  )

describe('Menu component', () => {
  beforeEach(() => {
    vi.clearAllMocks() // reset call counts and return values between tests
  })

  // ── unauthenticated state ──────────────────────────────────────────────────
  describe('when the user is NOT signed in', () => {
    beforeEach(() => {
      // isAuthenticated() returns false → guest UI
      auth.isAuthenticated.mockReturnValue(false)
    })

    it('shows Sign up and Sign In links', () => {
      renderMenu()
      expect(screen.getByText('Sign up')).toBeInTheDocument()
      expect(screen.getByText('Sign In')).toBeInTheDocument()
    })

    it('does NOT show My Profile or Sign out', () => {
      renderMenu()
      expect(screen.queryByText('My Profile')).not.toBeInTheDocument()
      expect(screen.queryByText('Sign out')).not.toBeInTheDocument()
    })
  })

  // ── authenticated state ────────────────────────────────────────────────────
  describe('when the user IS signed in', () => {
    const fakeAuth = { token: 'tok', user: { _id: 'u1', name: 'Alice', email: 'a@test.com' } }

    beforeEach(() => {
      // isAuthenticated() returns a JWT-shaped object → logged-in UI
      auth.isAuthenticated.mockReturnValue(fakeAuth)
    })

    it('shows My Profile and Sign out', () => {
      renderMenu()
      expect(screen.getByText('My Profile')).toBeInTheDocument()
      expect(screen.getByText('Sign out')).toBeInTheDocument()
    })

    it('does NOT show Sign up or Sign In', () => {
      renderMenu()
      expect(screen.queryByText('Sign up')).not.toBeInTheDocument()
      expect(screen.queryByText('Sign In')).not.toBeInTheDocument()
    })

    it('includes the user id in the My Profile link', () => {
      renderMenu()
      const link = screen.getByText('My Profile').closest('a')
      expect(link.getAttribute('href')).toContain('u1')
    })
  })
})
