// One place for every call to the Express API (the book repeated the same fetch code ten times).

// [BEGINNER] import.meta.env holds the VITE_* variables from .env, copied in at build time.
// Empty (the default) → relative URLs like /api/users: the Vite proxy in development, the
// same origin in production. Set VITE_API_URL only when the client lives on its own origin.
const API_URL = import.meta.env.VITE_API_URL ?? ''

/**
 * Call the API and return the parsed JSON.
 * Never throws: failures come back as { error: 'message' }, the shape the book's components
 * already check with `if (data.error)`.
 *
 * [BEGINNER] `= {}` gives the second parameter a default, and destructuring it in the
 * parameter list gives each option its own default (`method = 'GET'`).
 */
export async function request(path, { method = 'GET', body, token, signal } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  // [ADVANCED] The browser also sends the cookie "t" by itself. The server reads the cookie
  // first and this header second (server stage 13), so either one is enough.
  if (token) headers.Authorization = `Bearer ${token}`

  try {
    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      // [ADVANCED] 'include' sends/accepts the httpOnly cookie "t" even when VITE_API_URL points
      // to another origin (the server's CORS config must then allow credentials).
      credentials: 'include',
      // [ADVANCED] An AbortSignal lets a component cancel the request when it unmounts or when
      // the URL changes before the answer arrives (see Users.jsx).
      signal
    })
    // [BEGINNER] Some error responses (e.g. a proxy's 502 page) are not JSON; `.catch` turns a
    // parse failure into an empty object instead of an exception.
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      return { ...data, error: data.error ?? `Request failed (${response.status})`, status: response.status }
    }
    return data
  } catch (err) {
    // Network failure (server down, offline) or an aborted request
    return { error: err.name === 'AbortError' ? 'Request cancelled' : 'Cannot reach the server' }
  }
}
