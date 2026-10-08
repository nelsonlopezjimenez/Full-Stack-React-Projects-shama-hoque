import { useEffect, useState } from 'react'
import { list } from './api-user.js'

const Users = () => {
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    list(controller.signal).then((data) => {
      if (controller.signal.aborted) return
      if (data.error) setError(data.error)
      else setUsers(data)
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
