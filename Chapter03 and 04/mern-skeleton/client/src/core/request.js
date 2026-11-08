// never throws: every failure comes back as { error, status }
export const request = async (path, { method = 'GET', body, signal } = {}) => {
    try {
        const resp = await fetch(path, {
            method: method,
            headers: { 'Content-Type': 'application/json' },
            body: body === undefined ? undefined : JSON.stringify(body),
            signal: signal,
        })
        const data = await resp.json().catch(() => ({}));
        if (!resp.ok) {   //400,500,...
            return { ...data, error: data.error ?? `Request failed (${resp.status})`, status: resp.status }
        }
        return data
    } catch (err) {   // no answer at all: server down or request cancelled
        return { error: err.name === 'AbortError' ? 'Request cancelled' : 'Cannot reach the server' }
    }
}
export default request
