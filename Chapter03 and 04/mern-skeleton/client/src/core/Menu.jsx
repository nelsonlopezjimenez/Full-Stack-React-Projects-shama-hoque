import { NavLink, useLocation, useNavigate } from 'react-router'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import HomeIcon from '@mui/icons-material/Home'
import auth from '../auth/auth-helper.js'

const navSx = {
  color: 'common.white',
  '&.active': { color: 'secondary.main' }
}

const Menu = () => {
  const navigate = useNavigate()
  useLocation()

  const jwt = auth.isAuthenticated()

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" color="inherit">
          MERN Skeleton
        </Typography>
        <IconButton component={NavLink} to="/" end aria-label="Home" sx={navSx}>
          <HomeIcon />
        </IconButton>
        <Button component={NavLink} to="/users" end sx={navSx}>Users</Button>

        {jwt ? (
          <>
            <Button component={NavLink} to={`/users/${jwt.user._id}`} end sx={navSx}>
              My Profile
            </Button>
            <Button color="inherit" onClick={() => auth.signout(() => navigate('/'))}>
              Sign out
            </Button>
          </>
        ) : (
          <>
            <Button component={NavLink} to="/signup" sx={navSx}>Sign up</Button>
            <Button component={NavLink} to="/signin" sx={navSx}>Sign In</Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  )
}

export default Menu
