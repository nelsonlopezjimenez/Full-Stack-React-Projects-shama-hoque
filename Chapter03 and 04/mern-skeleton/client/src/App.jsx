import { useState } from 'react'
import Users from './user/Users.jsx'
import Signup from './user/Signup.jsx'

const App = () => {
  const [version, setVersion] = useState(0)

  return (
    <main>
      <h1>MERN Skeleton</h1>
      <Signup onCreated={() => setVersion((v) => v + 1)} />
      <Users key={version} />
    </main>
  )
}

export default App
