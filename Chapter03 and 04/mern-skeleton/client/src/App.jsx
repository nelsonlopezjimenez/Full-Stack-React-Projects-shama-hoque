import { BrowserRouter } from 'react-router'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { indigo, pink } from '@mui/material/colors'
import MainRouter from './MainRouter.jsx'

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
const App = () => (
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      {/* [BEGINNER] CssBaseline resets browser styles (e.g. body margin), replacing the
          inline styles of the book's template.js. */}
      <CssBaseline />
      <MainRouter />
    </ThemeProvider>
  </BrowserRouter>
)

export default App
