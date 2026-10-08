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

const EditProfile = () => {
  const { userId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
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
      else setValues((v) => ({ ...v, name: data.name, email: data.email }))
    })
    return () => controller.abort()
  }, [userId])

  const handleChange = (name) => (event) => {
    setValues((v) => ({ ...v, [name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const user = {
      name: values.name || undefined,
      email: values.email || undefined,
      password: values.password || undefined
    }
    const data = await update(userId, jwt.token, user)
    if (data.status === 401) return setRedirectToSignin(true)
    if (data.error) return setError(data.error)
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
