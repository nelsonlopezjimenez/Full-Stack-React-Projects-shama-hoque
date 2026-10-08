import { request } from '../core/request.js'

export const create = (user) =>
  request('/api/users', { method: 'POST', body: user })

export const list = (signal) =>
  request('/api/users', { signal })

export const read = (userId, token, signal) =>
  request(`/api/users/${userId}`, { token, signal })

export const update = (userId, token, user) =>
  request(`/api/users/${userId}`, { method: 'PATCH', token, body: user })
