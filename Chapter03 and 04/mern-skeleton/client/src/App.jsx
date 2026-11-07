import { useState } from 'react'
import Users from './Users.jsx'
import Signup from './Signup.jsx';

const App = () => {
  const [version, setVersion] = useState(0);
  
  const onCreated = (version) => {
    return version + 1 
  }
  return(
  <main>
    <h1>MERN Skeleton</h1>
    <Signup onCreated={onCreated} />
    <Users key={version}  />
  </main>
  )
}

export default App
