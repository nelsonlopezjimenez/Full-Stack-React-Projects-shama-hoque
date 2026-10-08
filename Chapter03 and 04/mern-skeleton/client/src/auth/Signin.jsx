import { useState } from 'react'
import { useNavigate } from 'react-router'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { signin } from './api-auth.js'
import FormError from '../core/FormError.jsx'

// The same layout values appear in Signup and EditProfile (repeated, as in the book).
const cardSx = { maxWidth: 600, mx: 'auto', mt: 5, pb: 2, textAlign: 'center' }
const fieldSx = { mx: 1, width: 300 }

const Signin = () => {
  // [BEGINNER] useNavigate() gives a function that changes the page from code, e.g. after a
  // successful request. <Link> is for clicks, navigate() is for "when this is done, go there".
  const navigate = useNavigate()
  const [values, setValues] = useState({ email: '', password: '' })
  const [error, setError] = useState('')

  const handleChange = (name) => (event) => {
    setValues((v) => ({ ...v, [name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const data = await signin(values)
    if (data.error) {
      // One message for "no such email" and "wrong password" (server stage 09).
      setError(data.error)
      return
    }
    // [ADVANCED] The answer is { token, user }, and the response ALSO set the httpOnly cookie
    // "t" (server stage 13). The browser stores that cookie and sends it with every later
    // request to this origin by itself, so the profile below loads. This page ignores the
    // token for now; stage 09 explains why the client still needs { user }.
    navigate(`/users/${data.user._id}`)
  }

  return (
    <Card component="form" onSubmit={handleSubmit} sx={cardSx}>
      <CardContent>
        <Typography variant="h6" component="h2" sx={{ mt: 2, color: (theme) => theme.palette.openTitle }}>
          Sign In
        </Typography>
        {/* `required` lets the browser check for empty fields before the request is sent. */}
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
