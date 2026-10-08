import { useEffect, useState } from 'react'

const Users = () => {
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    fetch('/api/users', { signal: controller.signal })
      .then((response) => response.json())
      .then((data) => setUsers(data))
      .catch((err) => {
        if (err.name !== 'AbortError') setError('Cannot reach the server')
      })
    return () => controller.abort()
  }, [])

  return (
    <section>
      <h2>All Users</h2>
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
