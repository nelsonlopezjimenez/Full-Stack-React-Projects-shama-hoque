import { NavLink } from 'react-router'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import HomeIcon from '@mui/icons-material/Home'

// [BEGINNER] NavLink adds the CSS class "active" when its `to` matches the current URL, so the
// book's isActive(history, path) helper is not needed: the `&.active` rule does the job.
// `end` means "only when the URL matches exactly" (otherwise "/" would be active everywhere).
const navSx = {
  color: 'common.white',
  '&.active': { color: 'secondary.main' }
}

const Menu = () => (
  <AppBar position="static">
    <Toolbar>
      <Typography variant="h6" color="inherit">
        MERN Skeleton
      </Typography>
      {/* [BEGINNER] `component={NavLink}` renders the MUI button AS a router link: one element
          instead of the book's <Link><Button/></Link>, which nested a <button> in an <a>
          (invalid HTML). */}
      <IconButton component={NavLink} to="/" end aria-label="Home" sx={navSx}>
        <HomeIcon />
      </IconButton>
      <Button component={NavLink} to="/users" end sx={navSx}>Users</Button>
      <Button component={NavLink} to="/signup" sx={navSx}>Sign up</Button>
      <Button component={NavLink} to="/signin" sx={navSx}>Sign In</Button>
    </Toolbar>
  </AppBar>
)

export default Menu
