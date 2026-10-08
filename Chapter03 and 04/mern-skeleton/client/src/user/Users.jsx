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
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    list(controller.signal).then((data) => {
      if (controller.signal.aborted) return
      if (data.error) setError(data.error)
      else setUsers(data)
    })
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
