import { useState } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { indigo, pink } from '@mui/material/colors'
import Home from './core/Home.jsx'
import Users from './user/Users.jsx'
import Signup from './user/Signup.jsx'

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
    openTitle: indigo[400],
    protectedTitle: pink[400],
  },
})

const App = () => {
  const [version, setVersion] = useState(0)

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Home />
      <Signup onCreated={() => setVersion((v) => v + 1)} />
      <Users key={version} />
    </ThemeProvider>
  )
}

export default App
