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

// Same React 19 form-action pattern as Signin.jsx (see the comments there).
const Signup = () => {
  const [state, formAction, isPending] = useActionState(async (previousState, formData) => {
    // [BEGINNER] Object.fromEntries(formData) turns all named fields into one object:
    // { name: '...', email: '...', password: '...' }
    const user = Object.fromEntries(formData)
    const data = await create(user)
    if (data.error) {
      // The server sends every validation problem at once (dbErrorHandler, server step 5.6).
      // Keep name and email in the fields; the password is cleared on purpose.
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
          {/* [ADVANCED] No `required` attributes here on purpose: an empty form reaches the
              server, which answers with all its validation messages (good for class demos).
              Signin uses `required` to show the browser-side check instead. */}
          <FormError message={state.error} />
        </CardContent>
        <CardActions>
          <Button type="submit" color="primary" variant="contained" disabled={isPending}
            sx={{ mx: 'auto', mb: 2 }}>
            Submit
          </Button>
        </CardActions>
      </Card>

      {/* [BEGINNER] Without an onClose prop, clicking outside or pressing Escape does not close
          the dialog; the book needed disableBackdropClick (removed from MUI) for that. */}
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
