const API_URL = import.meta.env.VITE_API_URL ?? ''

export async function request(path, { method = 'GET', body, token, signal } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'
  if (token) headers.Authorization = `Bearer ${token}`

  try {
    const response = await fetch(`${API_URL}${path}`, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: 'include',
      signal
    })
    const data = await response.json().catch(() => ({}))
    if (!response.ok) {
      return { ...data, error: data.error ?? `Request failed (${response.status})`, status: response.status }
    }
    return data
  } catch (err) {
    return { error: err.name === 'AbortError' ? 'Request cancelled' : 'Cannot reach the server' }
  }
}
