import { useState } from 'react';
import api from './api-user.js'

const Signup = ({ onCreated }) => {
    const cout = (event) => console.log(event)
    const cout2 = (event) => console.log(event.target.value)
    const cout3 = (event) => console.log(event.target)
    const cout4 = (event) => console.log(event.currentTarget)

    const [formData, setFormData] = useState({ name: "", email: "", password: "" });
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('');
        const data = await api.create(formData)
        if (data.error) {   // request() never throws: errors come back as { error }
            setError(data.error)
            return
        }
        setFormData({ name: "", email: "", password: "" })
        onCreated()
    }
    return (
        <>
            <form action="" onSubmit={handleSubmit} >
                <input type="text" value={formData.name} onChange={handleChange} name='name'/>
                <input type="text" value={formData.email} name='email' id="emailId" onChange={handleChange} />
                <input type="text" value={formData.password} id="passwordId" onChange={handleChange} name='password' />
                <input type="submit" value="SUBMIT" />
            </form>
             {error && <p style={{ color: 'red' }}>{error}</p>}
        </>
    )
}

export default Signup