import React from 'react';
import MainRouter from './MainRouter';
import { BrowserRouter } from 'react-router';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { teal, orange } from '@mui/material/colors';

const theme = createTheme({
  palette: {
    primary: {
      light: '#52c7b8',
      main: '#009688',
      dark: '#00675b',
      contrastText: '#fff',
    },
    secondary: {
      light: '#ffd95b',
      main: '#ffa726',
      dark: '#c77800',
      contrastText: '#000',
    },
    openTitle: teal['700'],
    protectedTitle: orange['700'],
    mode: 'light',
  },
});

const App = () => (
  <BrowserRouter>
    <ThemeProvider theme={theme}>
      <MainRouter />
    </ThemeProvider>
  </BrowserRouter>
);

export default App;
