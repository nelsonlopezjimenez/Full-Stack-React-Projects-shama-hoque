import { useState } from 'react';

const Signup = ({ onCreated }) => {
    const cout = (event) => console.log(event)
    const cout2 = (event) => console.log(event.target.value)
    const cout3 = (event) => console.log(event.target)
    const cout4 = (event) => console.log(event.currenTarget)

    const [formData, setFormData] = useState({ name: "", email: "", password: "" });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }
    const handleSubmit = async (e) => {
        e.preventDefault()
        const resp = await fetch('/api/users', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
        const data = await resp.json();
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
        </>
    )
}

export default Signup