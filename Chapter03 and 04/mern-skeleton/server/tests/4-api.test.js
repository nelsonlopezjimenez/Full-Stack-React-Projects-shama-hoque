import { describe, it, before, after } from 'node:test'
import assert from 'node:assert/strict'
import jwt from 'jsonwebtoken'

process.env.NODE_ENV = 'test'
const { default: app } = await import('../express.js')
const { default: config } = await import('../config/config.js')

let server
let baseUrl

before(async () => {
  server = app.listen(0)
  await new Promise((resolve) => server.once('listening', resolve))
  baseUrl = `http://localhost:${server.address().port}`
})
after(() => server.close())

const anyId = '0123456789abcdef01234567'

describe('API without a database', () => {
  it('answers unknown /api routes with JSON 404', async () => {
    const res = await fetch(`${baseUrl}/api/nope`)
    assert.equal(res.status, 404)
    assert.deepEqual(await res.json(), { error: 'Route not found: GET /api/nope' })
  })

  it('rejects a protected route without a token (401, before any DB lookup)', async () => {
    const res = await fetch(`${baseUrl}/api/users/${anyId}`)
    assert.equal(res.status, 401)
  })

  it('rejects an expired token', async () => {
    const token = jwt.sign({ _id: anyId, exp: Math.floor(Date.now() / 1000) - 60 }, config.jwtSecret)
    const res = await fetch(`${baseUrl}/api/users/${anyId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    assert.equal(res.status, 401)
    assert.match((await res.json()).error, /jwt expired/)
  })

  it('reads the token from the httpOnly cookie "t" (not only from the header)', async () => {
    const token = jwt.sign({ _id: anyId, exp: Math.floor(Date.now() / 1000) - 60 }, config.jwtSecret)
    const res = await fetch(`${baseUrl}/api/users/${anyId}`, {
      headers: { Cookie: `t=${token}` }
    })
    assert.equal(res.status, 401)
    assert.match((await res.json()).error, /jwt expired/)
  })

  it('rejects a token signed with another secret', async () => {
    const token = jwt.sign({ _id: anyId }, 'not-the-server-secret')
    const res = await fetch(`${baseUrl}/api/users/${anyId}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    assert.equal(res.status, 401)
  })

  it('asks for email and password on sign in', async () => {
    const res = await fetch(`${baseUrl}/api/auth/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({})
    })
    assert.equal(res.status, 400)
  })

  it('answers malformed JSON with 400, not 500', async () => {
    const res = await fetch(`${baseUrl}/api/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{bad json'
    })
    assert.equal(res.status, 400)
  })

  it('signs out with DELETE and clears the cookie', async () => {
    const res = await fetch(`${baseUrl}/api/auth/sessions`, { method: 'DELETE' })
    assert.equal(res.status, 200)
    assert.match(res.headers.get('set-cookie'), /^t=;.*Expires=Thu, 01 Jan 1970/)
  })

  it('no longer signs out with GET (a GET must not change anything)', async () => {
    const res = await fetch(`${baseUrl}/api/auth/sessions`)
    assert.equal(res.status, 404)
  })

  it('sends security headers (helmet) and no CORS header by default', async () => {
    const res = await fetch(`${baseUrl}/api/nope`, { headers: { Origin: 'http://evil.test' } })
    assert.ok(res.headers.get('content-security-policy'))
    assert.equal(res.headers.get('x-powered-by'), null)
    assert.equal(res.headers.get('access-control-allow-origin'), null)
  })
})
