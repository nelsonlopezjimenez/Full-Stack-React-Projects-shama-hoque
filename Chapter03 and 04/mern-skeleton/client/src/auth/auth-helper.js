import { signout } from './api-auth.js'

const STORAGE_KEY = 'jwt'

// [ADVANCED] The payload (middle part) of a JWT is base64url-encoded JSON, readable by anyone.
// Reading `exp` here only improves the user experience (an expired session looks signed out
// immediately); the server still checks the signature and the expiry on every request.
const isExpired = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')))
    return typeof payload.exp === 'number' && payload.exp * 1000 < Date.now()
  } catch {
    // [BEGINNER] `catch {` without `(err)` (ES2019) when the error itself is not needed
    return true
  }
}

// [ADVANCED] The token lives in sessionStorage (cleared when the tab closes), as in the book.
// Any script running on the page can read it, so an XSS bug would leak it. The server also
// sets the same token as an httpOnly cookie that scripts cannot read, and reads that cookie
// first (server stage 13). Dropping this storage and asking the server "who am I?" instead
// is the more secure design (idea L1 in chat/ch03-client-ladder-checklist.md).
const auth = {
  // Returns { token, user } when signed in, otherwise false (same contract as the book)
  isAuthenticated() {
    // [BEGINNER] The book checked `typeof window == "undefined"` because the same code also
    // ran on the server (SSR). Without SSR this code only runs in the browser.
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
    // [BEGINNER] `cb?.()` calls cb only if it was passed (optional call).
    cb?.()
  },

  async signout(cb) {
    sessionStorage.removeItem(STORAGE_KEY)
    cb?.()
    // The server clears the httpOnly cookie. The book also tried
    // `document.cookie = "t=; expires=..."`, which cannot touch an httpOnly cookie.
    await signout()
  }
}

export default auth
