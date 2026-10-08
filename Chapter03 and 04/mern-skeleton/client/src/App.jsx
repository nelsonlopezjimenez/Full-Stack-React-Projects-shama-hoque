import { useState } from 'react'
import Users from './user/Users.jsx'
import Signup from './user/Signup.jsx'

// [BEGINNER] A React component is a function whose name starts with a capital letter and
// that returns what to show. The HTML-like syntax is JSX: Vite turns it into plain
// JavaScript function calls before the browser sees it.
//
// [BEGINNER] Since React 17's "new JSX transform", files with JSX no longer need
// `import React from 'react'`; import only what you use (hooks, StrictMode, ...).
const App = () => {
  // [BEGINNER] "Lifting state up": Signup and Users are siblings and cannot talk to each other.
  // Their parent keeps a counter; Signup increases it, and the counter is Users' `key`.
  // [ADVANCED] A new key makes React throw the old <Users> away and create a new one, which
  // runs its effect again and so reloads the list. Stage 06 puts the two on separate pages.
  const [version, setVersion] = useState(0)

  return (
    <main>
      <h1>MERN Skeleton</h1>
      {/* [BEGINNER] Components are used like HTML tags; attributes become props. */}
      <Signup onCreated={() => setVersion((v) => v + 1)} />
      <Users key={version} />
    </main>
  )
}

export default App
