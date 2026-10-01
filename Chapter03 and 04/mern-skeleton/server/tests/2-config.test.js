import { describe, it, afterEach } from 'node:test'
import assert from 'node:assert/strict'

let counter = 0
const loadConfig = () => import(`../config/config.js?fresh=${++counter}`)

const savedEnv = { ...process.env }
afterEach(() => {
  process.env = { ...savedEnv }
})

describe('config', () => {
  it('uses safe development defaults', async () => {
    delete process.env.NODE_ENV
    delete process.env.PORT
    delete process.env.CORS_ORIGIN
    delete process.env.CLIENT_DIST
    const { default: config } = await loadConfig()
    assert.equal(config.env, 'development')
    assert.equal(config.port, 3000)
    assert.equal(config.jwtExpiresIn, '1d')
    assert.deepEqual(config.corsOrigins, [])
    assert.equal(config.clientDist, null)
  })

  it('refuses to start in production without JWT_SECRET', async () => {
    process.env.NODE_ENV = 'production'
    delete process.env.JWT_SECRET
    await assert.rejects(loadConfig(), /JWT_SECRET must be set in production/)
  })

  it('splits CORS_ORIGIN into a clean list', async () => {
    process.env.CORS_ORIGIN = ' http://a.test , ,http://b.test'
    const { default: config } = await loadConfig()
    assert.deepEqual(config.corsOrigins, ['http://a.test', 'http://b.test'])
  })
})
