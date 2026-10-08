import { useEffect, useState } from 'react'

const Users = () => {
  // [BEGINNER] useState replaces this.state / this.setState of the book's class component.
  // It returns the current value and a function that sets a new value and re-renders.
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')

  // [BEGINNER] useEffect(fn, []) runs fn after the first render: the hook version of
  // componentDidMount. The empty array means "no dependencies, run once".
  // The component cannot simply call fetch() while rendering: rendering must only describe the
  // page, and it happens again on every state change (that would be an endless loop).
  useEffect(() => {
    const controller = new AbortController()
    // [BEGINNER] A relative URL: the request goes to the same server that sent the page (Vite, on
    // port 5173), and Vite forwards everything under /api to Express (see vite.config.js).
    fetch('/api/users', { signal: controller.signal })
      .then((response) => response.json())
      .then((data) => setUsers(data))
      .catch((err) => {
        // An aborted request (see the cleanup below) is not an error worth showing.
        if (err.name !== 'AbortError') setError('Cannot reach the server')
      })
    // [BEGINNER] The function returned by an effect is its cleanup: it runs when the page is
    // left, so a late answer is ignored instead of updating a page that is gone.
    // [ADVANCED] In development, StrictMode runs every effect twice on purpose (mount, cleanup,
    // mount), so the Network tab shows a first request that was cancelled. That is expected.
    return () => controller.abort()
  }, [])

  return (
    <section>
      <h2>All Users</h2>
      {/* [BEGINNER] `condition && <p>...</p>`: show the paragraph only when there is an error. */}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {users.map((item) => (
          // [BEGINNER] key must be stable and unique: the database id. The book used the array
          // index (key={i}), which confuses React when items are added or removed.
          <li key={item._id}>{item.name}</li>
        ))}
      </ul>
    </section>
  )
}

export default Users
