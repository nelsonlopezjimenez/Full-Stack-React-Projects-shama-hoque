import { useState } from 'react'
import Card from '@mui/material/Card'
import CardActions from '@mui/material/CardActions'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import { create } from './api-user.js'
import FormError from '../core/FormError.jsx'

// [BEGINNER] Style objects outside the component: they never change, so they are created once.
const cardSx = { maxWidth: 600, mx: 'auto', mt: 5, pb: 2, textAlign: 'center' }
const fieldSx = { mx: 1, width: 300 }

const emptyForm = { name: '', email: '', password: '' }

// [BEGINNER] Props arrive as the function's first argument; `{ onCreated }` destructures the
// one we need. App passes a function here, so Signup can tell App "a user was created".
const Signup = ({ onCreated }) => {
  // [BEGINNER] "Controlled inputs": React state holds every field value, and each input shows
  // that value and reports changes with onChange. One state object for the whole form.
  const [values, setValues] = useState(emptyForm)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  // [BEGINNER] A function that returns a function ("currying", same as the book): each input
  // gets its own handler, e.g. onChange={handleChange('email')}.
  // [name] is a computed property key: the object key comes from the variable.
  // The spread (...v) copies the old values, so only one field changes. React state must be
  // replaced, never mutated in place.
  const handleChange = (name) => (event) => {
    setValues((v) => ({ ...v, [name]: event.target.value }))
  }

  // [BEGINNER] async/await, as on the server: `await` waits for the Promise without .then().
  const handleSubmit = async (event) => {
    // Stop the browser from reloading the page, which is what a <form> does by default.
    event.preventDefault()
    setError('')
    setMessage('')
    const data = await create(values)
    // The server sends every validation problem at once in `error` (server stage 08), and
    // request() puts "Cannot reach the server" in the same place.
    if (data.error) {
      setError(data.error)
      return
    }
    setValues(emptyForm)
    setMessage(data.message)
    onCreated()
  }

  return (
    // [BEGINNER] A real <form> (Card rendered as component="form"): onSubmit runs for the button
    // AND for Enter in a field. The book only listened to the button's onClick.
    <Card component="form" onSubmit={handleSubmit} sx={cardSx}>
      <CardContent>
        <Typography variant="h6" component="h2" sx={{ mt: 2, color: (theme) => theme.palette.openTitle }}>
          Sign Up
        </Typography>
        {/* [BEGINNER] TextField = label + input + helper text in one component. The `id` links
            the label to the input, so clicking the label focuses the field. */}
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
        {/* [BEGINNER] variant "contained" is the old "raised". type="submit" submits the form. */}
        <Button type="submit" color="primary" variant="contained" sx={{ mx: 'auto', mb: 2 }}>
          Submit
        </Button>
      </CardActions>
    </Card>
  )
}

export default Signup
