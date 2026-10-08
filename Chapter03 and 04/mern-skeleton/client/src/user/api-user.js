import { request } from '../core/request.js'

// [BEGINNER] Arrow functions with an implicit return: `(x) => request(...)` returns the
// Promise from request() without writing `{ return ... }`.
//
// One function per API route, named after what it does. The pages call these functions and
// never see URLs, methods or headers.
// The book's signatures were read(params, credentials) with params = { userId } and
// credentials = { t: token }. Plain arguments (userId, token) are easier to read and to call.

export const create = (user) =>
  request('/api/users', { method: 'POST', body: user })

export const list = (signal) =>
  request('/api/users', { signal })

// [BEGINNER] A template literal (`...${userId}`) builds the URL /api/users/<id>.
export const read = (userId, token, signal) =>
  request(`/api/users/${userId}`, { token, signal })
