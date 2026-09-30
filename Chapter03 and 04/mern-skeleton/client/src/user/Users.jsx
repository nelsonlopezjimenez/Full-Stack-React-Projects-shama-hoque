import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import Paper from '@mui/material/Paper'
import List from '@mui/material/List'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemAvatar from '@mui/material/ListItemAvatar'
import ListItemIcon from '@mui/material/ListItemIcon'
import ListItemText from '@mui/material/ListItemText'
import Avatar from '@mui/material/Avatar'
import Typography from '@mui/material/Typography'
import ArrowForward from '@mui/icons-material/ArrowForward'
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
  useEffect(() => {
    const controller = new AbortController()
    list(controller.signal).then((data) => {
      if (controller.signal.aborted) return
      if (data.error) setError(data.error) // the book only did console.log(data.error)
      else setUsers(data)
    })
    // [BEGINNER] The function returned by an effect is its cleanup: it runs when the page is
    // left, so a late answer is ignored instead of updating a page that is gone.
    return () => controller.abort()
  }, [])

  return (
    <Paper elevation={4} sx={{ p: 1, m: 5 }}>
      <Typography variant="h6" component="h2" sx={{ mt: 4, mb: 2, mx: 2, color: (theme) => theme.palette.openTitle }}>
        All Users
      </Typography>
      <FormError message={error} />
      <List dense>
        {users.map((item) => (
          // [BEGINNER] key must be stable and unique: the database id. The book used the array
          // index (key={i}), which confuses React when items are added or removed.
          // [ADVANCED] ListItemButton replaces MUI's removed `<ListItem button>`, and
          // component={Link} makes the whole row the link (the book wrapped it in <Link>).
          <ListItemButton key={item._id} component={Link} to={`/users/${item._id}`}>
            <ListItemAvatar>
              <Avatar>
                <Person />
              </Avatar>
            </ListItemAvatar>
            <ListItemText primary={item.name} />
            <ListItemIcon sx={{ minWidth: 0 }}>
              <ArrowForward />
            </ListItemIcon>
          </ListItemButton>
        ))}
      </List>
    </Paper>
  )
}

export default Users
