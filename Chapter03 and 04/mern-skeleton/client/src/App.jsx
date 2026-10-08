import Users from './Users.jsx'

// [BEGINNER] A React component is a function whose name starts with a capital letter and
// that returns what to show. The HTML-like syntax is JSX: Vite turns it into plain
// JavaScript function calls before the browser sees it.
//
// [BEGINNER] Since React 17's "new JSX transform", files with JSX no longer need
// `import React from 'react'`; import only what you use (hooks, StrictMode, ...).
const App = () => (
  <main>
    <h1>MERN Skeleton</h1>
    {/* [BEGINNER] Components are used like HTML tags. Users lives in its own file. */}
    <Users />
  </main>
)

export default App
