import { useState } from 'react'
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
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname ?? '/'
  const [values, setValues] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const handleChange = (name) => (event) => {
    setValues((v) => ({ ...v, [name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const data = await signin(values)
    if (data.error) {
      setError(data.error)
      return
    }
    auth.authenticate(data, () => navigate(from, { replace: true }))
  }

  return (
    <Card component="form" onSubmit={handleSubmit} sx={cardSx}>
      <CardContent>
        <Typography variant="h6" component="h2" sx={{ mt: 2, color: (theme) => theme.palette.openTitle }}>
          Sign In
        </Typography>
        <TextField id="email" type="email" label="Email" required value={values.email}
          onChange={handleChange('email')} autoComplete="email" sx={fieldSx} margin="normal" /><br />
        <TextField id="password" type="password" label="Password" required value={values.password}
          onChange={handleChange('password')} autoComplete="current-password" sx={fieldSx} margin="normal" />
        <FormError message={error} />
      </CardContent>
      <CardActions>
        <Button type="submit" color="primary" variant="contained" sx={{ mx: 'auto', mb: 2 }}>
          Submit
        </Button>
      </CardActions>
    </Card>
  )
}

export default Signin
