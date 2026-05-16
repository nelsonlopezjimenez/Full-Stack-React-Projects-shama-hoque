import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import HomeIcon from '@mui/icons-material/Home';
import { Link } from 'react-router';
import auth from './../auth/auth-helper';
import { withRouter } from './../withRouter';

const isActive = (history, path) => {
  if (history.location.pathname === path) return { color: '#ffa726' };
  else return { color: '#ffffff' };
};

const Menu = withRouter(({ history }) => (
  <AppBar position='static'>
    <Toolbar>
      <Typography
        variant='h6'
        color='inherit'
      >
        MERN Social
      </Typography>
      <Link to='/'>
        <IconButton
          aria-label='Home'
          style={isActive(history, '/')}
        >
          <HomeIcon />
        </IconButton>
      </Link>
      {!auth.isAuthenticated() && (
        <span>
          <Link to='/signup'>
            <Button style={isActive(history, '/signup')}>Sign up</Button>
          </Link>
          <Link to='/signin'>
            <Button style={isActive(history, '/signin')}>Sign In</Button>
          </Link>
        </span>
      )}
      {auth.isAuthenticated() && (
        <span>
          <Link to={'/user/' + auth.isAuthenticated().user._id}>
            <Button
              style={isActive(
                history,
                '/user/' + auth.isAuthenticated().user._id
              )}
            >
              My Profile
            </Button>
          </Link>
          <Button
            color='inherit'
            onClick={() => {
              auth.signout(() => history.push('/'));
            }}
          >
            Sign out
          </Button>
        </span>
      )}
    </Toolbar>
  </AppBar>
));

export default Menu;
