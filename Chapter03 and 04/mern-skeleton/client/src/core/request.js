const request = async (path, { method, body, signal }) => {
    const resp = await fetch(path, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
    })
    const data = await resp.json().catch(() => ({}));
    if (!resp.ok) {   //400,500,...
        throw new Error (data.error ?? `Server error (${resp.status})`)
    }
    return data
}
export default request