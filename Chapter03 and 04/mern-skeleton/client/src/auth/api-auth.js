import { request } from '../core/request.js'

export const signin = (user) =>
  request('/api/auth/sessions', { method: 'POST', body: user })
