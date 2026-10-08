import { useState } from 'react'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { create } from './api-user.js'
import FormError from '../core/FormError.jsx'

const cardSx = { maxWidth: 600, mx: 'auto', mt: 5, pb: 2, textAlign: 'center' }
const fieldSx = { mx: 1, width: 300 }

const emptyForm = { name: '', email: '', password: '' }

const Signup = () => {
  const [values, setValues] = useState(emptyForm)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleChange = (name) => (event) => {
    setValues((v) => ({ ...v, [name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setMessage('')
    const data = await create(values)
    if (data.error) {
      setError(data.error)
      return
    }
    setValues(emptyForm)
    setMessage(data.message)
  }

  return (
    <Card component="form" onSubmit={handleSubmit} sx={cardSx}>
      <CardContent>
        <Typography variant="h6" component="h2" sx={{ mt: 2, color: (theme) => theme.palette.openTitle }}>
          Sign Up
        </Typography>
        <TextField id="name" label="Name" value={values.name} onChange={handleChange('name')}
          autoComplete="name" sx={fieldSx} margin="normal" /><br />
        <TextField id="email" type="email" label="Email" value={values.email} onChange={handleChange('email')}
          autoComplete="email" sx={fieldSx} margin="normal" /><br />
        <TextField id="password" type="password" label="Password" value={values.password}
          onChange={handleChange('password')} autoComplete="new-password" sx={fieldSx} margin="normal" />
        <FormError message={error} />
        {message && <Typography sx={{ mt: 1, color: 'success.main' }}>{message}</Typography>}
      </CardContent>
      <CardActions>
        <Button type="submit" color="primary" variant="contained" sx={{ mx: 'auto', mb: 2 }}>
          Submit
        </Button>
      </CardActions>
    </Card>
  )
}

export default Signup
