import { useEffect, useState } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router'
import Paper from '@mui/material/Paper'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import Avatar from '@mui/material/Avatar'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Edit from '@mui/icons-material/Edit'
import Person from '@mui/icons-material/Person'
import auth from '../auth/auth-helper.js'
import { read } from './api-user.js'
import FormError from '../core/FormError.jsx'

const Profile = () => {
  // [BEGINNER] useParams() reads :userId from the URL /users/:userId (the book used
  // this.props.match.params.userId, passed in by React Router 4).
  const { userId } = useParams()
  const location = useLocation()
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')
  const [redirectToSignin, setRedirectToSignin] = useState(false)
  const jwt = auth.isAuthenticated()

  // [BEGINNER] [userId] is the dependency list: the effect runs again whenever userId changes,
  // e.g. going from someone else's profile to "My Profile". The book needed a second lifecycle method for
  // this, componentWillReceiveProps, which React has since deprecated.
  useEffect(() => {
    const controller = new AbortController()
    setError('')
    // PrivateRoute only renders this page for a signed-in user, so jwt is never false here.
    read(userId, jwt.token, controller.signal).then((data) => {
      // [ADVANCED] If userId changed (or the page was left) before this answer arrived, the
      // cleanup below already aborted the request: ignore it, or an OLD profile could overwrite
      // the new one (a race condition the book had). In development, StrictMode runs every
      // effect twice on purpose, so the first request is always aborted: that is expected.
      if (controller.signal.aborted) return
      if (data.status === 401) setRedirectToSignin(true) // token expired or invalid
      else if (data.error) setError(data.error)
      else setUser(data)
    })
    return () => controller.abort()
    // [ADVANCED] jwt.token is read once per userId on purpose. The linter rule
    // react-hooks/exhaustive-deps (if you add ESLint) would ask to list it too; both work.
  }, [userId])

  // [BEGINNER] Rendering <Navigate> changes the page, like navigate() but from JSX.
  if (redirectToSignin) {
    return <Navigate to="/signin" replace state={{ from: location }} />
  }

  // Only the owner sees the edit button. This is only for the looks: the server checks the
  // same thing on every PATCH and answers 403 (server stage 11).
  const isOwnProfile = user && jwt.user._id === user._id

  return (
    <Paper elevation={4} sx={{ maxWidth: 600, mx: 'auto', mt: 5, p: 3 }}>
      <Typography variant="h6" component="h2" sx={{ mt: 1, mb: 2, color: (theme) => theme.palette.protectedTitle }}>
        Profile
      </Typography>
      <FormError message={error} />
      {/* [BEGINNER] The book started with user = '' and rendered "Joined: Invalid Date" until the
          data arrived. Rendering nothing until `user` exists avoids that flash. */}
      {user && (
        <List dense>
          {/* [ADVANCED] `secondaryAction` replaces MUI's deprecated <ListItemSecondaryAction>. */}
          <ListItem
            secondaryAction={isOwnProfile && (
              <IconButton component={Link} to={`/users/${user._id}/edit`} aria-label="Edit" color="primary">
                <Edit />
              </IconButton>
            )}
          >
            <ListItemAvatar>
              <Avatar>
                <Person />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={user.name} secondary={user.email} />
          </ListItem>
          <Divider />
          <ListItem>
            <ListItemText primary={`Joined: ${new Date(user.created).toDateString()}`} />
          </ListItem>
        </List>
      )}
    </Paper>
  )
}

export default Profile
