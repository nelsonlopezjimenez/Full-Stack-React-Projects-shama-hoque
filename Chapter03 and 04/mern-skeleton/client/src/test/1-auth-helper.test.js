import { describe, it, expect, vi } from 'vitest'
import auth from '../auth/auth-helper.js'
import { fakeToken, signInAs } from './helpers.js'

vi.mock('../auth/api-auth.js', () => ({
  signout: vi.fn(() => Promise.resolve({ message: 'signed out' }))
}))

describe('auth-helper', () => {
  it('is signed out when nothing is stored', () => {
    expect(auth.isAuthenticated()).toBe(false)
  })

  it('returns the stored session', () => {
    const user = signInAs()
    expect(auth.isAuthenticated().user).toEqual(user)
  })

  it('treats an expired token as signed out', () => {
    const expired = fakeToken({ _id: 'u1', exp: Math.floor(Date.now() / 1000) - 60 })
    sessionStorage.setItem('jwt', JSON.stringify({ token: expired, user: { _id: 'u1' } }))
    expect(auth.isAuthenticated()).toBe(false)
  })

  it('survives garbage in sessionStorage', () => {
    sessionStorage.setItem('jwt', '{not json')
    expect(auth.isAuthenticated()).toBe(false)
  })

  it('signout clears the session, runs the callback and tells the server', async () => {
    const { signout } = await import('../auth/api-auth.js')
    signInAs()
    const cb = vi.fn()
    await auth.signout(cb)
    expect(sessionStorage.getItem('jwt')).toBeNull()
    expect(cb).toHaveBeenCalledOnce()
    expect(signout).toHaveBeenCalledOnce()
  })
})
