import { useState } from 'react'
import { useNavigate } from 'react-router'
import IconButton from '@mui/material/IconButton'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import DeleteIcon from '@mui/icons-material/Delete'
import auth from '../auth/auth-helper.js'
import { remove } from './api-user.js'
import FormError from '../core/FormError.jsx'

const DeleteUser = ({ userId }) => {
  const [open, setOpen] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const deleteAccount = async () => {
    const jwt = auth.isAuthenticated()
    const data = await remove(userId, jwt.token)
    if (data.error) {
      setError(data.error)
      return
    }
    auth.signout(() => navigate('/'))
  }

  return (
    <>
      <IconButton aria-label="Delete" onClick={() => setOpen(true)} color="secondary">
        <DeleteIcon />
      </IconButton>

      <Dialog open={open} onClose={() => setOpen(false)}>
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Confirm to delete your account.
          </DialogContentText>
          <FormError message={error} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={deleteAccount} color="secondary" autoFocus>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default DeleteUser
