import { useEffect, useState } from 'react'
import { Navigate, useLocation, useNavigate, useParams } from 'react-router'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import auth from '../auth/auth-helper.js'
import { read, update } from './api-user.js'
import FormError from '../core/FormError.jsx'

const cardSx = { maxWidth: 600, mx: 'auto', mt: 5, pb: 2, textAlign: 'center' }
const fieldSx = { mx: 1, width: 300 }

// [BEGINNER] "Controlled inputs" again, as in Signup and Signin: React state holds every field
// value (value + onChange). Here they are also the natural fit, because the fields are filled
// from the server after the page loads.
const EditProfile = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  // [BEGINNER] One state object for the whole form instead of one useState per field.
  const [values, setValues] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [redirectToSignin, setRedirectToSignin] = useState(false)
  const jwt = auth.isAuthenticated()

  useEffect(() => {
    const controller = new AbortController()
    read(userId, jwt.token, controller.signal).then((data) => {
      if (controller.signal.aborted) return
      if (data.status === 401) setRedirectToSignin(true)
      else if (data.error) setError(data.error)
      // [BEGINNER] Functional update: `(v) => ({ ...v, ... })` receives the latest state, and
      // the spread (...) copies it so only name and email change. React state must be
      // replaced, never mutated in place.
      else setValues((v) => ({ ...v, name: data.name, email: data.email }))
    })
    return () => controller.abort()
  }, [userId])

  // [BEGINNER] A function that returns a function ("currying", same as the book): each
  // TextField gets its own handler, e.g. onChange={handleChange('email')}.
  // [name] is a computed property key: the object key comes from the variable.
  const handleChange = (name) => (event) => {
    setValues((v) => ({ ...v, [name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    // [BEGINNER] Stop the browser from reloading the page, which is what a <form> does by default.
    event.preventDefault()
    // `|| undefined` leaves empty fields out of the JSON, so a blank password is not changed.
    const user = {
      name: values.name || undefined,
      email: values.email || undefined,
      password: values.password || undefined
    }
    const data = await update(userId, jwt.token, user)
    if (data.status === 401) return setRedirectToSignin(true)
    if (data.error) return setError(data.error)
    // The book stored redirectToProfile in state and rendered <Redirect>; navigate() is direct.
    navigate(`/users/${data._id}`)
  }

  if (redirectToSignin) {
    return <Navigate to="/signin" replace state={{ from: location }} />
  }

  return (
    <Card component="form" onSubmit={handleSubmit} sx={cardSx}>
      <CardContent>
        <Typography variant="h6" component="h2" sx={{ m: 2, color: (theme) => theme.palette.protectedTitle }}>
          Edit Profile
        </Typography>
        <TextField id="name" label="Name" value={values.name} onChange={handleChange('name')}
          autoComplete="name" sx={fieldSx} margin="normal" /><br />
        <TextField id="email" type="email" label="Email" value={values.email} onChange={handleChange('email')}
          autoComplete="email" sx={fieldSx} margin="normal" /><br />
        <TextField id="password" type="password" label="Password" value={values.password}
          onChange={handleChange('password')} helperText="Leave empty to keep the current password"
          autoComplete="new-password" sx={fieldSx} margin="normal" />
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

export default EditProfile
