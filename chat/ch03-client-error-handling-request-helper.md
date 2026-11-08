# Chapter 03 client — Error handling in the request helper: throw, return, try/catch

**Date:** 2026-11-08
**Project:** `Chapter03 and 04/mern-skeleton/client` (client stage 08, `core/request.js`)
**Status:** Q&A, then code changed on `nocommnt/ch03-client-08-request-helper` (back to the lesson's
"never throws" design).

---

## The question

> When the email is not correctly formatted, the page does not show the error. Should `request.js`
> `throw` or `return`? Is `try/catch` the only way to catch an error? Which pattern is most common?

## `throw` vs `return`

- **`return`** hands a value back as a normal result. Users or the string `"Server error"`: the caller
  can't tell which, unless it inspects the value.
- **`throw`** stops the function and skips the code after the call. Control jumps to the nearest `catch`;
  with no `catch`, the console shows "Uncaught".
- In an `async` function, `throw` makes the returned Promise **rejected**. `await` inside `try/catch`
  catches it, and so does `.catch()` on the Promise.

`fetch` itself throws only when there is **no answer at all** (server down, offline, cancelled). A 400
or 500 answer is a *successful* fetch, with `resp.ok === false`. Turning that into an error is your code's job.

Use `new Error('message')`, not a string. It gives you `err.message`, `err.name` (`'AbortError'` for a
cancelled fetch) and `err.stack` (the file and line).

```js
throw new Error(data.error ?? `Request failed (${resp.status})`)   // good
throw 'Request failed'                                             // works, but no stack, no .message
```

## Patterns, from most common to least common

### 1. The helper throws; the component catches with `try/catch` (most common)

This is how `axios` behaves, and TanStack Query (React Query) *requires* it: a query function must
throw so the library knows the request failed.

```js
// core/request.js
if (!resp.ok) throw new Error(data.error ?? `Request failed (${resp.status})`)
return data

// api-user.js: no try/catch here, errors pass through
export const create = (user) => request('/api/users', { method: 'POST', body: user })

// Signup.jsx: the component knows what to do with the error
try {
  await create(formData)
} catch (err) {
  setError(err.message)
  return
}
```

Strength: a forgotten `catch` is loud (an "Uncaught" error in the console), not silent.

### 2. Same as 1, with `.then().catch()`

The same mechanism, written with Promise methods. It's older style, but common inside `useEffect`:

```js
list(controller.signal)
  .then((data) => setUsers(data))
  .catch((err) => { if (err.name !== 'AbortError') setError(err.message) })
```

### 3. The helper never throws; it returns `{ error, status }` (the design of lesson 08)

`try/catch` is written **once**, inside the helper. Every page checks the result with an `if`.
Supabase works this way (`{ data, error }`), and so does Go. It suits teaching because the flow reads
top to bottom, and later stages use `status` (stage 14 checks for `401`).

```js
// core/request.js
export const request = async (path, { method = 'GET', body, signal } = {}) => {
  try {
    const resp = await fetch(path, { method, headers: { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : JSON.stringify(body), signal })
    const data = await resp.json().catch(() => ({}))
    if (!resp.ok) {
      return { ...data, error: data.error ?? `Request failed (${resp.status})`, status: resp.status }
    }
    return data
  } catch (err) {   // no answer at all
    return { error: err.name === 'AbortError' ? 'Request cancelled' : 'Cannot reach the server' }
  }
}

// Signup.jsx
const data = await create(formData)
if (data.error) {
  setError(data.error)
  return
}
```

Weakness: a forgotten `if (data.error)` lets the error pass **silently**.

### 4. `try/catch` inside every API function (`list`, `create`): uncommon

```js
export const create = async (user) => {
  try { return await request(...) } catch (err) { console.log(err) }   // then what?
}
```

`create` can't show a message under the form; only the component can. So it either swallows the error
or rethrows it, and both are pointless. Handle errors in the component, or in one global place (an error
boundary, React Query's `onError`).

### To avoid: mixing the designs

The helper must pick **one** contract and every caller must follow it: *always throw* (callers use
`try/catch`) or *always return an object* (callers check `data.error`). Returning a plain string on an
error, a `try/catch` around a helper that never throws, or an `if (data.error)` after a helper that
throws all break silently. The next section shows what happened with this exact mistake.

## The bug: an error returned as a string, and a page that looked fine

The code at the time:

```js
// request.js: an error came back as a plain string, not { error }
if (!resp.ok) {
  return (data.error ?? `Server error (${resp.status})`)
}

// api-user.js: not awaited, and always the same answer
export const create = async (user) => {
  const createOneUser = request('/api/users', { method: 'POST', body: user })
  return 'created one user'
}

// Signup.jsx: not awaited, no check
const handleSubmit = async (e) => {
  e.preventDefault()
  setError('')
  const setOneUser = api.create(formData)
  setFormData({ name: '', email: '', password: '' })
  onCreated()
}
```

```jsx
// App.jsx
<Signup onCreated={() => setVersion((v) => v + 1)} />
<Users key={version} />
```

What happened after submitting `ann@wrong` as the email:

1. `api.create(formData)` started the request but nobody waited, so `handleSubmit` ran straight on.
2. The form was cleared, so the bad input disappeared.
3. `onCreated()` bumped `version`. A new `key` makes React throw away `<Users>` and mount a new one,
   so it fetched the list again.
4. The server refused the user (400, `"Please fill a valid email address."`), so the new list was
   **the same as before**. The page re-rendered with the previous data and looked like a normal submit.
5. The error string came back from `request` to `create`, which ignored it and returned
   `'created one user'`. Nobody called `setError`, so nothing appeared under the form.

The failure was invisible for three reasons: no `await`, a success value returned unconditionally, and an
error shape (a string) that no caller checked.

The same string would also have broken the list. If `GET /api/users` had failed, `setUsers("Server error (500)")`
would put a string in `users`: `users.length` counts its characters, and `users.map` is not a function, so
the page crashes.

## Common pitfalls

| Pitfall | What you see | Fix |
|---|---|---|
| Not awaiting: `const data = api.create(...)` | `data` is a `Promise`; the code after it runs before the answer | `await api.create(...)` |
| `async` function returns "the data" | The caller still gets a Promise: `async` always wraps the return value | `await` (or `.then`) in the caller too |
| `async` callback for `useEffect` | React warns: an effect must return a cleanup function, not a Promise | Define an inner `async` function and call it |
| Expecting `fetch` to throw on 400/500 | No error, `resp.ok` is `false` | Check `resp.ok` |
| Returning the error as a string | The caller thinks it's data (see the bug above) | `{ error, status }` or `throw new Error` |
| `signal` destructured but not passed to `fetch` | `controller.abort()` does nothing | `fetch(path, { ..., signal })` |
| `signal: 'signal'` (a string) | `TypeError` once it reaches `fetch` | Pass the `AbortSignal` object, or nothing |
| Showing the "cancelled" error | In development, StrictMode mounts twice; the first request is aborted on purpose | `if (controller.signal.aborted) return` |
| Empty `catch {}` | The error vanishes | At least `setError(...)`, or rethrow |
| `throw 'text'` | No `err.message`, no stack | `throw new Error('text')` |
| `= {}` missing in `request(path, { method } = {})` | `request('/api/users')` crashes: can't destructure `undefined` | Keep the `= {}` default |

## The final code (lesson 08 design)

```js
// api-user.js
export const list = (signal) => request('/api/users', { signal })
export const create = (user) => request('/api/users', { method: 'POST', body: user })
```

```jsx
// Users.jsx
useEffect(() => {
  const controller = new AbortController()
  const listAllUsers = async () => {
    const data = await api.list(controller.signal)
    if (controller.signal.aborted) return   // cancelled on purpose by the cleanup
    if (data.error) setError(data.error)
    else setUsers(data)
  }
  listAllUsers()
  return () => controller.abort()
}, [])
```

```jsx
// Signup.jsx
const handleSubmit = async (e) => {
  e.preventDefault()
  setError('')
  const data = await api.create(formData)
  if (data.error) {
    setError(data.error)   // "Please fill a valid email address."
    return                 // keep the input, don't refresh the list
  }
  setFormData({ name: '', email: '', password: '' })
  onCreated()
}
```

`request.js` is the one in pattern 3. To switch to pattern 1 later, only two things change: `request`
throws instead of returning `{ error }`, and each `if (data.error)` becomes a `try/catch`.
