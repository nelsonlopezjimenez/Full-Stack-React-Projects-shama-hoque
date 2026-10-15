// [BEGINNER] A React component is a function whose name starts with a capital letter and
// that returns what to show. The HTML-like syntax is JSX: Vite turns it into plain
// JavaScript function calls before the browser sees it.
//
// [BEGINNER] Since React 17's "new JSX transform", files with JSX no longer need
// `import React from 'react'`; import only what you use (hooks, StrictMode, ...).
const App = () => (
  <main>
    <h1>MERN Skeleton</h1>
    <p>Hello from React.</p>
  </main>
)

export default App
