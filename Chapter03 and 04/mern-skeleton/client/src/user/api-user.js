import request from '../core/request.js'

export const list = async (signal) => {
    const loadUsers =  await request('/api/users',
        {method:'get', signal: signal}
     )
    // console.log('line8', loadUsers)
     return  await loadUsers
}

export const create = (user) => {
    const createUser = request('/api/users',
        {
            method:'POST',
            body: "",
            signal: 'signal'
        }
    )
    return 'created one user'
}
export default {
    list,
    create
}