import { request } from '../core/request.js'

export const create = (user) =>
  request('/api/users', { method: 'POST', body: user })

export const list = (signal) =>
  request('/api/users', { signal })
