import { request } from '../core/request.js'

// [BEGINNER] Arrow functions with an implicit return: `(x) => request(...)` returns the
// Promise from request() without writing `{ return ... }`.
//
// The book's signatures were read(params, credentials) with params = { userId } and
// credentials = { t: token }. Plain arguments (userId, token) are easier to read and to call.

export const create = (user) =>
  request('/api/users', { method: 'POST', body: user })

export const list = (signal) =>
  request('/api/users', { signal })

export const read = (userId, token, signal) =>
  request(`/api/users/${userId}`, { token, signal })

// PATCH, not the book's PUT: only the changed fields are sent (server step 3.8)
export const update = (userId, token, user) =>
  request(`/api/users/${userId}`, { method: 'PATCH', token, body: user })

export const remove = (userId, token) =>
  request(`/api/users/${userId}`, { method: 'DELETE', token })
