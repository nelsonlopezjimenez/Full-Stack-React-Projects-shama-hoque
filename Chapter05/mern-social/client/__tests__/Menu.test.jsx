/**
 * LEVEL 4 — React component test
 *
 * NOTE (main branch): source files are at client/*.jsx (not client/src/*.jsx).
 * Paths from client/__tests__/ → ../core/Menu, ../auth/auth-helper, etc.
 *
 * render()         — mount component into jsdom DOM
 * screen           — query the rendered DOM
 * MemoryRouter     — router context without a real browser URL
 * mockReturnValue()— control what isAuthenticated() returns per test
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'

vi.mock('../auth/auth-helper', () => ({
  default: {
    isAuthenticated: vi.fn(),
    signout: vi.fn(),
  },
}))

vi.mock('../auth/api-auth.jsx', () => ({
  signout: vi.fn().mockResolvedValue({}),
}))

import Menu from '../core/Menu'
import auth from '../auth/auth-helper'

const renderMenu = (path = '/') =>
  render(
    <MemoryRouter initialEntries={[path]}>
      <Menu />
    </MemoryRouter>
  )

describe('Menu component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('when the user is NOT signed in', () => {
    beforeEach(() => {
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

  describe('when the user IS signed in', () => {
    const fakeAuth = { token: 'tok', user: { _id: 'u1', name: 'Alice', email: 'a@test.com' } }

    beforeEach(() => {
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
