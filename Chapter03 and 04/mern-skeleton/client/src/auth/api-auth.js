import { request } from '../core/request.js'

// [BEGINNER] REST routes from the server refactor (checklist step 3.8):
// a login session is a resource that is created (POST) and deleted (DELETE).
// Book: POST /auth/signin and GET /auth/signout.
export const signin = (user) =>
  request('/api/auth/sessions', { method: 'POST', body: user })

export const signout = () =>
  request('/api/auth/sessions', { method: 'DELETE' })
