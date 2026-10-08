// Level 3 — rendering a component inside a router and querying it like a user would.
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import Menu from '../core/Menu.jsx'
import { signInAs } from './helpers.js'

// [BEGINNER] MemoryRouter is a router that keeps the URL in memory instead of the address bar,
// so components that use NavLink/useNavigate can be tested. initialEntries = the current URL.
const renderAt = (url) =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <Menu />
    </MemoryRouter>
  )

describe('Menu', () => {
  it('offers Sign up / Sign In when signed out', () => {
    renderAt('/')
    // [BEGINNER] getByRole finds elements the way assistive technology sees them: a link
    // with the accessible name "Sign In". It throws if there is none, so it is also an assertion.
    expect(screen.getByRole('link', { name: 'Sign In' })).toHaveAttribute('href', '/signin')
    expect(screen.queryByRole('link', { name: 'My Profile' })).not.toBeInTheDocument()
  })

  it('links to the signed-in user\'s profile, with the REST-style URL', () => {
    signInAs({ _id: 'abc123', name: 'Ann', email: 'ann@test.io' })
    renderAt('/')
    expect(screen.getByRole('link', { name: 'My Profile' })).toHaveAttribute('href', '/users/abc123')
    expect(screen.getByRole('button', { name: 'Sign out' })).toBeInTheDocument()
  })

  it('marks only the current page as active (NavLink + end)', () => {
    renderAt('/users')
    expect(screen.getByRole('link', { name: 'Users' })).toHaveClass('active')
    expect(screen.getByRole('link', { name: 'Home' })).not.toHaveClass('active')
  })
})
