/**
 * LEVEL 2 — Config defaults
 *
 * Config files read from process.env at import time.  Because Node caches
 * modules, we use Vitest's `vi.resetModules()` + dynamic import() to reload
 * the module with different env values in each test.
 *
 * New concepts:
 *   - beforeEach / afterEach — run setup/teardown around every test
 *   - vi.resetModules()      — clears the module cache so re-import is fresh
 *   - dynamic import()       — ESM-safe way to import after changing env
 *   - process.env            — Node environment variables
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

describe('server config defaults', () => {
  // Save the original env values so we can restore them after each test
  let originalEnv

  beforeEach(() => {
    originalEnv = { ...process.env }
    vi.resetModules() // clear module cache so config.js re-evaluates process.env
  })

  afterEach(() => {
    // Restore any env vars we changed
    process.env = originalEnv
  })

  it('uses default port 3333 when PORT is not set', async () => {
    delete process.env.PORT
    const { default: config } = await import('../../config/config.js')
    expect(config.port).toBe(3333)
  })

  it('reads PORT from the environment when provided', async () => {
    process.env.PORT = '8080'
    const { default: config } = await import('../../config/config.js')
    expect(Number(config.port)).toBe(8080)
  })

  it('falls back to the hardcoded jwtSecret placeholder when JWT_SECRET is absent', async () => {
    delete process.env.JWT_SECRET
    const { default: config } = await import('../../config/config.js')
    expect(config.jwtSecret).toBe('YOUR_secret_key')
  })

  it('reads JWT_SECRET from the environment when provided', async () => {
    process.env.JWT_SECRET = 'test-secret-abc'
    const { default: config } = await import('../../config/config.js')
    expect(config.jwtSecret).toBe('test-secret-abc')
  })

  it('falls back to "development" when NODE_ENV is not set', async () => {
    delete process.env.NODE_ENV
    const { default: config } = await import('../../config/config.js')
    expect(config.env).toBe('development')
  })
})
