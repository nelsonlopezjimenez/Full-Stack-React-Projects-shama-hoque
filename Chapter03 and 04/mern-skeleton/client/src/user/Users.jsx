import { useEffect, useState } from 'react'
import Paper from '@mui/material/Paper'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemText from '@mui/material/ListItemText'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import Person from '@mui/icons-material/Person'
import { list } from './api-user.js'
import FormError from '../core/FormError.jsx'

const Users = () => {
  // [BEGINNER] useState replaces this.state / this.setState of the book's class component.
  // It returns the current value and a function that sets a new value and re-renders.
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')

  // [BEGINNER] useEffect(fn, []) runs fn after the first render: the hook version of
  // componentDidMount. The empty array means "no dependencies, run once".
  // The component cannot simply call fetch() while rendering: rendering must only describe the
  // page, and it happens again on every state change (that would be an endless loop).
  useEffect(() => {
    const controller = new AbortController()
    list(controller.signal).then((data) => {
      // request() never throws, so there is no .catch(). An aborted request (see the cleanup
      // below) answers { error: 'Request cancelled' }, which is not worth showing.
      if (controller.signal.aborted) return
      if (data.error) setError(data.error) // the book only did console.log(data.error)
      else setUsers(data)
    })
    // [BEGINNER] The function returned by an effect is its cleanup: it runs when the page is
    // left, so a late answer is ignored instead of updating a page that is gone.
    // [ADVANCED] In development, StrictMode runs every effect twice on purpose (mount, cleanup,
    // mount), so the Network tab shows a first request that was cancelled. That is expected.
    return () => controller.abort()
  }, [])

  return (
    // [BEGINNER] MUI components replace the plain <section>, <h2>, <ul> and <li>. `sx` is MUI's
    // style prop: p: 1 → padding theme.spacing(1) = 8px, m: 5 → margin 40px.
    <Paper elevation={4} sx={{ p: 1, m: 5 }}>
      {/* [BEGINNER] `variant` sets the look, `component` the HTML tag (h2 for screen readers).
          The color is a function of the theme: the custom openTitle color from App.jsx. */}
      <Typography variant="h6" component="h2" sx={{ mt: 4, mb: 2, mx: 2, color: (theme) => theme.palette.openTitle }}>
        All Users
      </Typography>
      <FormError message={error} />
      <List dense>
        {users.map((item) => (
          // [BEGINNER] key must be stable and unique: the database id. The book used the array
          // index (key={i}), which confuses React when items are added or removed.
          <ListItem key={item._id}>
            <ListItemAvatar>
              <Avatar>
                <Person />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={item.name} />
          </ListItem>
        ))}
      </List>
    </Paper>
  )
}

export default Users
