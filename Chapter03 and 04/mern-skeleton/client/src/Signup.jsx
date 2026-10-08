import { useState } from 'react'

const emptyForm = { name: '', email: '', password: '' }

const Signup = ({ onCreated }) => {
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
    const response = await fetch('/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values)
    })
    const data = await response.json()
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
      <form onSubmit={handleSubmit}>
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
