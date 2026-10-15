import TicTacToe from './tic-tac-toe/TicTacToe.jsx'

// [BEGINNER] A React component is a function whose name starts with a capital letter and
// that returns what to show. The HTML-like syntax is JSX: Vite turns it into plain
// JavaScript function calls before the browser sees it.
//
// [BEGINNER] Since React 17's "new JSX transform", files with JSX no longer need
// `import React from 'react'`; import only what you use (hooks, StrictMode, ...).
const App = () => (
  <main>
    <h1>MERN Skeleton</h1>
    {/* [BEGINNER] Stages 02–05: React's official Tic-Tac-Toe tutorial, in its own folder.
        TicTacToe.jsx's default export is the tutorial's top component (Square, then Board, later
        Game); the name an import gives to a default export is up to the importer.
        Stage 06 puts the game away and shows the users from the server here. */}
    <TicTacToe />
  </main>
)

export default App
