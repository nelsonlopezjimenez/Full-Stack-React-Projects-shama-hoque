import { useState } from 'react'

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
    // [ADVANCED] If the server is down, `await fetch` throws and the error only reaches the console.
    // Stage 04 moves all fetch code into one helper that handles that case once for every request.
    const response = await fetch('/api/users', {
      method: 'POST',
      // The server's express.json() only reads bodies that say they are JSON.
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values)
    })
    const data = await response.json()
    // [BEGINNER] fetch does NOT fail on 400 or 500: response.ok is false instead. The server
    // sends every validation problem at once in `error` (server stage 08).
    if (!response.ok) {
      setError(data.error)
      return
    }
    setValues(emptyForm)
    setMessage(data.message)
    onCreated()
  }

  return (
    <section>
      <h2>Sign Up</h2>
      {/* [BEGINNER] onSubmit runs for the button AND for Enter in a field. The book only
          listened to the button's onClick, so Enter did nothing. */}
      <form onSubmit={handleSubmit}>
        {/* [BEGINNER] In JSX, `for` is written htmlFor (`for` is a JavaScript keyword). */}
        <label htmlFor="name">Name</label>{' '}
        <input id="name" value={values.name} onChange={handleChange('name')} autoComplete="name" /><br />
        <label htmlFor="email">Email</label>{' '}
        <input id="email" type="email" value={values.email} onChange={handleChange('email')}
          autoComplete="email" /><br />
        <label htmlFor="password">Password</label>{' '}
        <input id="password" type="password" value={values.password} onChange={handleChange('password')}
          autoComplete="new-password" /><br />
        <button type="submit">Submit</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p>{message}</p>}
    </section>
  )
}

export default Signup
