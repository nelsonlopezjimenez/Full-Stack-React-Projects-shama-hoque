/**
 * LEVEL 2 — Config defaults
 *
 * config.js reads process.env at import time. Node caches modules, so we
 * use vi.resetModules() + dynamic import() to reload it fresh in each test.
 *
 * NOTE (main branch): config is at config/config.js (root level),
 * not server/config/config.js as on the refactor/separate-client-server branch.
 * Path from server/tests/unit/ → ../../../config/config.js
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('server config defaults', () => {
  let originalEnv

  beforeEach(() => {
    originalEnv = { ...process.env }
    vi.resetModules()
  })

  afterEach(() => {
    process.env = originalEnv
  })

  it('uses default port 3333 when PORT is not set', async () => {
    delete process.env.PORT
    const { default: config } = await import('../../../config/config.js')
    expect(config.port).toBe(3333)
  })

  it('reads PORT from the environment when provided', async () => {
    process.env.PORT = '8080'
    const { default: config } = await import('../../../config/config.js')
    expect(Number(config.port)).toBe(8080)
  })

  it('falls back to the placeholder jwtSecret when JWT_SECRET is absent', async () => {
    delete process.env.JWT_SECRET
    const { default: config } = await import('../../../config/config.js')
    expect(config.jwtSecret).toBe('YOUR_secret_key')
  })

  it('reads JWT_SECRET from the environment when provided', async () => {
    process.env.JWT_SECRET = 'test-secret-abc'
    const { default: config } = await import('../../../config/config.js')
    expect(config.jwtSecret).toBe('test-secret-abc')
  })

  it('falls back to "development" when NODE_ENV is not set', async () => {
    delete process.env.NODE_ENV
    const { default: config } = await import('../../../config/config.js')
    expect(config.env).toBe('development')
  })
})
