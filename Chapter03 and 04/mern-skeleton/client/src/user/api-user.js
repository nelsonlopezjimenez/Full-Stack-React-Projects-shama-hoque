import request from '../core/request.js'

export const list = async (signal) => {
    const loadUsers =  await request('/api/users',
        {method:'get', signal: signal}
     )
     return  await loadUsers
}

export const create = async (user) => {
    const createOneUser = await request('/api/users',
        {
            method:'POST',
            body: user,
        }
    )
    return createOneUser
}
export default {
    list,
    create
}