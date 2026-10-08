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
import { read } from './api-user.js'
import FormError from '../core/FormError.jsx'

const Profile = () => {
  const { userId } = useParams()
  const [user, setUser] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    setError('')
    read(userId, controller.signal).then((data) => {
      if (controller.signal.aborted) return
      if (data.error) setError(data.error)
      else setUser(data)
    })
    return () => controller.abort()
  }, [userId])

  return (
    <Paper elevation={4} sx={{ maxWidth: 600, mx: 'auto', mt: 5, p: 3 }}>
      <Typography variant="h6" component="h2" sx={{ mt: 1, mb: 2, color: (theme) => theme.palette.protectedTitle }}>
        Profile
      </Typography>
      <FormError message={error} />
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
