import { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import Paper from '@mui/material/Paper'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import Divider from '@mui/material/Divider'
import Person from '@mui/icons-material/Person'
import auth from '../auth/auth-helper.js'
import { read } from './api-user.js'
import FormError from '../core/FormError.jsx'

const Profile = () => {
  // [BEGINNER] useParams() reads :userId from the URL /users/:userId (the book used
  // this.props.match.params.userId, passed in by React Router 4).
  const { userId } = useParams()
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')
  const jwt = auth.isAuthenticated()

  // [BEGINNER] [userId] is the dependency list: the effect runs again whenever userId changes,
  // e.g. going from one profile to another. The book needed a second lifecycle method for
  // this, componentWillReceiveProps, which React has since deprecated.
  useEffect(() => {
    const controller = new AbortController()
    setError('')
    // [BEGINNER] `jwt?.token`: jwt is false for a signed-out visitor, and `false.token` is
    // undefined anyway, but `?.` says "this may be missing" (stage 10 protects the page).
    read(userId, jwt?.token, controller.signal).then((data) => {
      // [ADVANCED] If userId changed (or the page was left) before this answer arrived, the
      // cleanup below already aborted the request: ignore it, or an OLD profile could overwrite
      // the new one (a race condition the book had). In development, StrictMode runs every
      // effect twice on purpose, so the first request is always aborted: that is expected.
      if (controller.signal.aborted) return
      if (data.error) setError(data.error)
      else setUser(data)
    })
    return () => controller.abort()
    // [ADVANCED] jwt.token is read once per userId on purpose. The linter rule
    // react-hooks/exhaustive-deps (if you add ESLint) would ask to list it too; both work.
  }, [userId])

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
          <ListItem>
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
