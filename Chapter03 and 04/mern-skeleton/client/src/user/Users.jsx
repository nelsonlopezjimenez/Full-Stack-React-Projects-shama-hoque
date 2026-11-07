import { useEffect, useState } from 'react'

const Users = () => {
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    const loadUsers = async () => {
      try {
        const response = await fetch('/api/users', { signal: controller.signal })
        const data = await response.json()
        setUsers(data)
      } catch (err) {
        if (err.name !== 'AbortError') setError('Cannot reach the server')
      }
    }
    loadUsers()
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
