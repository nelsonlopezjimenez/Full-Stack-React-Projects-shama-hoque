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

const cardSx = { maxWidth: 600, mx: 'auto', mt: 5, pb: 2, textAlign: 'center' }
const fieldSx = { mx: 1, width: 300 }

const Signin = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const from = location.state?.from?.pathname ?? '/'

  const [state, formAction, isPending] = useActionState(
    async (previousState, formData) => {
      const user = {
        email: formData.get('email'),
        password: formData.get('password')
      }
      const data = await signin(user)
      if (data.error) {
        return { error: data.error, email: user.email }
      }
      auth.authenticate(data, () => navigate(from, { replace: true }))
      return { error: '', email: '' }
    },
    { error: '', email: '' }
  )

  return (
    <Card component="form" action={formAction} sx={cardSx}>
      <CardContent>
        <Typography variant="h6" component="h2" sx={{ mt: 2, color: (theme) => theme.palette.openTitle }}>
          Sign In
        </Typography>
        <TextField id="email" name="email" type="email" label="Email" required
          defaultValue={state.email} autoComplete="email" sx={fieldSx} margin="normal" /><br />
        <TextField id="password" name="password" type="password" label="Password" required
          autoComplete="current-password" sx={fieldSx} margin="normal" />
        <FormError message={state.error} />
      </CardContent>
      <CardActions>
        <Button type="submit" color="primary" variant="contained" disabled={isPending}
          sx={{ mx: 'auto', mb: 2 }}>
          {isPending ? 'Signing in…' : 'Submit'}
        </Button>
      </CardActions>
    </Card>
  )
}

export default Signin
