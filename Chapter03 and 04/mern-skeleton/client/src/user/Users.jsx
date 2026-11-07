import { useEffect, useState } from 'react'
// import request from '../core/request.js'
import api from './api-user.js'
import {list} from './api-user.js'

const Users = () => {
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')
  useEffect(() => {
    const controller = new AbortController()

    const listAllUsers = async () => {
      const data = await api.list(controller.signal)
      setUsers(data)
    }
    const getAllUsers =  async () => {
      const data = await list(controller.signal)
      setUsers(data)
    }
    listAllUsers()
    
    return () => controller.abort()
  }, [])
  return (
    <section>
      <h2>All Users : {users.length}</h2>
      {/* [BEGINNER] `condition && <p>...</p>`: show the paragraph only when there is an error. */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {users.map((item) => (
          <li key={item._id}>{item.name}</li>
        ))}
      </ul>
    </section>
  )
}
export default Users

/**
 * An `async` function always returns a Promise. That's true even when you `await` inside it and return the real data.

In [api-user.js](user/api-user.js), `await` gives you the real users inside `list`, which is why `console.log('line8', ...)` shows them. But because `list` is `async`, whatever it returns is wrapped in a Promise again before it reaches the caller. So in [Users.jsx](user/Users.jsx) you have to unwrap it a second time, with `await` or `.then()`.

The `useEffect` callback itself can't be `async`, because React expects it to return the cleanup function, not a Promise. So you define a small async function inside it and call it. That's the same pattern as the `loadUsers` code you commented out:

```jsx
useEffect(() => {
  const controller = new AbortController()

  const loadUsers = async () => {
    const data = await list(controller.signal)   // unwrap the promise here
    setUsers(data)                               // now it's the real array
  }
  loadUsers()

  return () => controller.abort()
}, [])
```

You can also use `.then()`, which does the same thing:

```jsx
list(controller.signal).then((data) => setUsers(data))
```

Your `list` function is fine as it is.

There are two smaller problems in [request.js](core/request.js) that you'll run into next:

1. **The signal is never passed to `fetch`.** You destructure `signal` but never use it, so `controller.abort()` does nothing. Add it to the fetch options: `fetch(path, { method, headers, body: JSON.stringify(body), signal })`.
2. **On an error it returns a string, not an array.** If the server fails, `setUsers("Server error (500)")` would make `users.map` crash. One fix is to `throw new Error(data.error ?? ...)` in `request.js`. Then in `loadUsers`, wrap the call in `try/catch` and call `setError(err.message)` (skip it when `err.name === 'AbortError'`), like your old commented-out code did.

I haven't changed any of your files. Tell me if you want me to apply these changes.
 */
