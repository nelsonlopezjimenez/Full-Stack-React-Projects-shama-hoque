import request from '../core/request.js'

export const list = (signal) =>
    request('/api/users', { signal })

export const create = (user) =>
    request('/api/users', { method: 'POST', body: user })

export default {
    list,
    create
}
