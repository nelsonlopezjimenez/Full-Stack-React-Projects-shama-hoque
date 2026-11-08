import { useEffect, useState } from 'react'
import api from './api-user.js'

const Users = () => {
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')
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
  return (
    <section>
      <h2>All Users : {users.length}</h2>
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
