import { useActionState } from 'react'
import { Link } from 'react-router'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { create } from './api-user.js'
import FormError from '../core/FormError.jsx'

const cardSx = { maxWidth: 600, mx: 'auto', mt: 5, pb: 2, textAlign: 'center' }
const fieldSx = { mx: 1, width: 300 }

const initialState = { error: '', open: false, values: { name: '', email: '' } }

const Signup = () => {
  const [state, formAction, isPending] = useActionState(async (previousState, formData) => {
    const user = Object.fromEntries(formData)
    const data = await create(user)
    if (data.error) {
      return { error: data.error, open: false, values: { name: user.name, email: user.email } }
    }
    return { ...initialState, open: true }
  }, initialState)

  return (
    <>
      <Card component="form" action={formAction} sx={cardSx}>
        <CardContent>
          <Typography variant="h6" component="h2" sx={{ mt: 2, color: (theme) => theme.palette.openTitle }}>
            Sign Up
          </Typography>
          <TextField id="name" name="name" label="Name" defaultValue={state.values.name}
            autoComplete="name" sx={fieldSx} margin="normal" /><br />
          <TextField id="email" name="email" type="email" label="Email" defaultValue={state.values.email}
            autoComplete="email" sx={fieldSx} margin="normal" /><br />
          <TextField id="password" name="password" type="password" label="Password"
            autoComplete="new-password" sx={fieldSx} margin="normal" />
          <FormError message={state.error} />
        </CardContent>
        <CardActions>
          <Button type="submit" color="primary" variant="contained" disabled={isPending}
            sx={{ mx: 'auto', mb: 2 }}>
            Submit
          </Button>
        </CardActions>
      </Card>

      <Dialog open={state.open}>
        <DialogTitle>New Account</DialogTitle>
        <DialogContent>
          <DialogContentText>
            New account successfully created.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button component={Link} to="/signin" color="primary" variant="contained" autoFocus>
            Sign In
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default Signup
