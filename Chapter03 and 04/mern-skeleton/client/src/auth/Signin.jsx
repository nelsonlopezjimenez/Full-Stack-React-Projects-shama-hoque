import { useActionState } from 'react'
import { useLocation, useNavigate } from 'react-router'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import auth from './auth-helper.js'
import { signin } from './api-auth.js'
import FormError from '../core/FormError.jsx'

// The same layout values appear in Signup and EditProfile (repeated, as in the book).
const cardSx = { maxWidth: 600, mx: 'auto', mt: 5, pb: 2, textAlign: 'center' }
const fieldSx = { mx: 1, width: 300 }

const Signin = () => {
  const location = useLocation()
  const navigate = useNavigate()
  // [BEGINNER] Optional chaining + nullish coalescing: "the page PrivateRoute sent us away from,
  // or the home page". Replaces the book's `this.props.location.state || { from: ... }`.
  const from = location.state?.from?.pathname ?? '/'

  // [ADVANCED] React 19 form actions. useActionState(action, initialState) returns
  //   state      → whatever the action returned last time (here: { error, email })
  //   formAction → pass it to <form action={...}>
  //   isPending  → true while the async action runs (disables the button, no double submit)
  // The action receives the form's FormData, so there is no useState per input and no
  // onChange handler. EditProfile.jsx keeps the classic "controlled inputs" pattern for comparison.
  const [state, formAction, isPending] = useActionState(
    async (previousState, formData) => {
      const user = {
        email: formData.get('email'),
        password: formData.get('password')
      }
      const data = await signin(user)
      if (data.error) {
        // Returning the email puts it back in the field: after an action React resets the
        // form to each input's defaultValue.
        return { error: data.error, email: user.email }
      }
      // replace: true → the sign-in page is not kept in history ("Back" skips it).
      auth.authenticate(data, () => navigate(from, { replace: true }))
      return { error: '', email: '' }
    },
    { error: '', email: '' }
  )

  return (
    // [BEGINNER] A real <form> (Card rendered as component="form"): pressing Enter in a field
    // submits it. The book only listened to the button's onClick, so Enter did nothing.
    <Card component="form" action={formAction} sx={cardSx}>
      <CardContent>
        <Typography variant="h6" component="h2" sx={{ mt: 2, color: (theme) => theme.palette.openTitle }}>
          Sign In
        </Typography>
        {/* `name` is the key used by formData.get('email'). `required` lets the browser
            check for empty fields before the request is sent. */}
        <TextField id="email" name="email" type="email" label="Email" required
          defaultValue={state.email} autoComplete="email" sx={fieldSx} margin="normal" /><br />
        <TextField id="password" name="password" type="password" label="Password" required
          autoComplete="current-password" sx={fieldSx} margin="normal" />
        <FormError message={state.error} />
      </CardContent>
      <CardActions>
        {/* [BEGINNER] variant "contained" is the old "raised". type="submit" triggers the form action. */}
        <Button type="submit" color="primary" variant="contained" disabled={isPending}
          sx={{ mx: 'auto', mb: 2 }}>
          {isPending ? 'Signing in…' : 'Submit'}
        </Button>
      </CardActions>
    </Card>
  )
}

export default Signin
