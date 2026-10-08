import { useState } from 'react'
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

const emptyForm = { name: '', email: '', password: '' }

const Signup = () => {
  const [values, setValues] = useState(emptyForm)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)

  const handleChange = (name) => (event) => {
    setValues((v) => ({ ...v, [name]: event.target.value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    const data = await create(values)
    if (data.error) {
      setError(data.error)
      return
    }
    setValues(emptyForm)
    setOpen(true)
  }

  return (
    <>
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
        </CardContent>
        <CardActions>
          <Button type="submit" color="primary" variant="contained" sx={{ mx: 'auto', mb: 2 }}>
            Submit
          </Button>
        </CardActions>
      </Card>

      <Dialog open={open}>
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
