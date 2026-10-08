import { request } from '../core/request.js'

// [BEGINNER] Arrow functions with an implicit return: `(x) => request(...)` returns the
// Promise from request() without writing `{ return ... }`.
//
// One function per API route, named after what it does. The pages call these functions and
// never see URLs, methods or headers.

export const create = (user) =>
  request('/api/users', { method: 'POST', body: user })

export const list = (signal) =>
  request('/api/users', { signal })
