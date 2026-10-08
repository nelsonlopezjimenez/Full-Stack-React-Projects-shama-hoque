export async function request(path, { method = 'GET', body, signal } = {}) {
  const headers = { Accept: 'application/json' }
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  try {
    const response = await fetch(path, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
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
