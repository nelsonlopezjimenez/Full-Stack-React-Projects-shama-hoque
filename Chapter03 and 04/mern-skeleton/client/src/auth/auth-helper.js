import { signout } from './api-auth.js'

const STORAGE_KEY = 'jwt'

const isExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return typeof payload.exp === 'number' && payload.exp * 1000 < Date.now()
  } catch {
    return true
  }
}

const auth = {
  isAuthenticated() {
    try {
      const jwt = JSON.parse(sessionStorage.getItem(STORAGE_KEY))
      if (!jwt?.token || isExpired(jwt.token)) return false
      return jwt
    } catch {
      return false
    }
  },

  authenticate(jwt, cb) {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(jwt))
    cb?.()
  },

  async signout(cb) {
    sessionStorage.removeItem(STORAGE_KEY)
    cb?.()
    await signout()
  }
}

export default auth
