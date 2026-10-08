// One place for every call to the Express API (the book repeated the same fetch code ten times).

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
    // [BEGINNER] `path` is relative (/api/users): the request goes to the server that sent the page
    // (Vite on port 5173), and Vite forwards everything under /api to Express (vite.config.js).
    const response = await fetch(path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
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
