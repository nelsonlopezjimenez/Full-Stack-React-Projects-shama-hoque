import { request } from '../core/request.js'

// [BEGINNER] REST routes from the server (server stage 09): a login session is a resource
// that is created (POST) and, from stage 09 on, deleted (DELETE).
// Book: POST /auth/signin and GET /auth/signout.
export const signin = (user) =>
  request('/api/auth/sessions', { method: 'POST', body: user })
