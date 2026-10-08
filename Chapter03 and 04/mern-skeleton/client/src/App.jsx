import { useState } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { indigo, pink } from '@mui/material/colors'
import Home from './core/Home.jsx'
import Users from './user/Users.jsx'
import Signup from './user/Signup.jsx'

// [BEGINNER] Since React 17's "new JSX transform", files with JSX no longer need
// `import React from 'react'`; import only what you use (hooks, StrictMode, ...).

// Create a theme instance.
// [BEGINNER] createTheme replaces material-ui beta's createMuiTheme; `mode` replaces `type`.
const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      light: '#757de8',
      main: '#3f51b5',
      dark: '#002984',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ff79b0',
      main: '#ff4081',
      dark: '#c60055',
      contrastText: '#000',
    },
    // Custom keys from the book, used for page titles:
    // sx={{ color: (theme) => theme.palette.openTitle }}
    openTitle: indigo[400],
    protectedTitle: pink[400],
  },
})

// [BEGINNER] The book wrapped App in react-hot-loader's hot(module)(App). Vite's React
// plugin does hot reloading on its own, so App is exported as it is.
const App = () => {
  // [BEGINNER] "Lifting state up": Signup and Users are siblings and cannot talk to each other.
  // Their parent keeps a counter; Signup increases it, and the counter is Users' `key`.
  // [ADVANCED] A new key makes React throw the old <Users> away and create a new one, which
  // runs its effect again and so reloads the list. Stage 06 puts the two on separate pages.
  const [version, setVersion] = useState(0)

  return (
    // [BEGINNER] ThemeProvider makes the theme available to every MUI component inside it.
    <ThemeProvider theme={theme}>
      {/* [BEGINNER] CssBaseline resets browser styles (e.g. body margin), replacing the
          inline styles of the book's template.js. */}
      <CssBaseline />
      <Home />
      <Signup onCreated={() => setVersion((v) => v + 1)} />
      <Users key={version} />
    </ThemeProvider>
  )
}

export default App
