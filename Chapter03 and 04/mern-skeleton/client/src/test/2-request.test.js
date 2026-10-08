// Level 2 — replacing a global (fetch) to check what the API layer sends and returns.
import { describe, it, expect, vi, afterEach } from 'vitest'
import { request } from '../core/request.js'
import { update } from '../user/api-user.js'

const jsonResponse = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

afterEach(() => vi.unstubAllGlobals())

describe('request()', () => {
  it('sends PATCH with a JSON body and the Bearer token', async () => {
    // [BEGINNER] vi.stubGlobal swaps window.fetch for a fake; unstubAllGlobals restores it.
    const fetchMock = vi.fn(async () => jsonResponse(200, { _id: 'u1', name: 'New' }))
    vi.stubGlobal('fetch', fetchMock)

    const data = await update('u1', 'tok123', { name: 'New' })

    expect(data).toEqual({ _id: 'u1', name: 'New' })
    const [url, options] = fetchMock.mock.calls[0]
    expect(url).toBe('/api/users/u1')
    expect(options.method).toBe('PATCH')
    expect(options.headers.Authorization).toBe('Bearer tok123')
    expect(JSON.parse(options.body)).toEqual({ name: 'New' })
  })

  it('turns an error status into { error, status }', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => jsonResponse(401, { error: 'UnauthorizedError: jwt expired' })))
    expect(await request('/api/users/u1')).toMatchObject({ error: 'UnauthorizedError: jwt expired', status: 401 })
  })

  it('never throws when the server is down', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => { throw new TypeError('Failed to fetch') }))
    expect(await request('/api/users')).toEqual({ error: 'Cannot reach the server' })
  })
})
