import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router'
import PrivateRoute from '../auth/PrivateRoute.jsx'
import { signInAs } from './helpers.js'

const FakeSignin = () => {
  const location = useLocation()
  return <p>Sign-in page, from: {location.state?.from?.pathname}</p>
}

const renderApp = (url) =>
  render(
    <MemoryRouter initialEntries={[url]}>
      <Routes>
        <Route path="/signin" element={<FakeSignin />} />
        <Route element={<PrivateRoute />}>
          <Route path="/users/:userId/edit" element={<p>Edit page</p>} />
        </Route>
      </Routes>
    </MemoryRouter>
  )

describe('PrivateRoute', () => {
  it('redirects to /signin and remembers the page that was asked for', () => {
    renderApp('/users/u1/edit')
    expect(screen.getByText('Sign-in page, from: /users/u1/edit')).toBeInTheDocument()
    expect(screen.queryByText('Edit page')).not.toBeInTheDocument()
  })

  it('renders the protected page (through <Outlet />) when signed in', () => {
    signInAs()
    renderApp('/users/u1/edit')
    expect(screen.getByText('Edit page')).toBeInTheDocument()
  })
})
