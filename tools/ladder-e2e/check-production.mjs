// node check-production.mjs <clientDir> <serverDir>
// The three ways of running the built client (client stage 15 and later):
//   1. `vite preview` of dist/ with the /api proxy
//   2. one process: the Express server serves dist/ (CLIENT_DIST), with the SPA fallback
//   3. client on its own origin: a build with VITE_API_URL, against a server with CORS_ORIGIN,
//      and the same kind of build against a server WITHOUT CORS_ORIGIN (must fail)
// The ladder server on LADDER_API_PORT must be running; this script starts three more on the
// next three ports and uses preview ports 4210–4212.
import { pathToFileURL } from 'node:url'
import path from 'node:path'
import { chromium } from 'playwright-core'
import { api, fillSignin } from './scenarios.mjs'
import { apiBase, apiPort, outDir, launchBrowser, startServer } from './config.mjs'

const [clientDir, serverDir] = process.argv.slice(2)
if (!clientDir || !serverDir) {
  console.log('usage: node check-production.mjs <clientDir> <serverDir>')
  process.exit(2)
}
const vite = await import(pathToFileURL(path.join(clientDir, 'node_modules/vite/dist/node/index.js')).href)
const dist = (name) => path.join(outDir, 'prod', name)
const build = async (name, apiUrl) => {
  if (apiUrl) process.env.VITE_API_URL = apiUrl
  try {
    await vite.build({ root: clientDir, logLevel: 'error', build: { outDir: dist(name), emptyOutDir: true } })
  } finally {
    delete process.env.VITE_API_URL
  }
}
const preview = (name, port, proxy = {}) =>
  vite.preview({ root: clientDir, logLevel: 'error', build: { outDir: dist(name) }, preview: { port, strictPort: true, proxy } })

const browser = await launchBrowser(chromium)
const problems = []
const newPage = async () => {
  const page = await (await browser.newContext()).newPage()
  page.on('pageerror', (e) => problems.push('pageerror: ' + e.message))
  page.on('console', (m) => {
    if (m.type() === 'error' && !m.text().startsWith('Failed to load resource') && !m.text().includes('CORS policy')) problems.push(m.text())
  })
  return page
}
const see = async (page, text) => {
  await page.getByText(text).first().waitFor({ timeout: 8000 })
  console.log('  ✓ sees', JSON.stringify(text))
}
const children = []
const closers = []
let ok = true
try {
  const stamp = Date.now()
  const name = 'Prod ' + stamp
  const email = `prod.${stamp}@test.io`
  await api('POST', '/api/users', { name, email, password: 'secret123' })
  const id = (await api('GET', '/api/users')).data.find((u) => u.name === name)._id

  console.log('• 1. vite preview of the build, /api through the proxy')
  await build('same-origin')
  let server = await preview('same-origin', 4210, { '/api': apiBase })
  closers.push(server)
  let page = await newPage()
  await page.goto('http://localhost:4210/users')
  await see(page, name)

  console.log('• 2. one process: Express serves the build (CLIENT_DIST)')
  children.push(await startServer(serverDir, apiPort + 1, { CLIENT_DIST: dist('same-origin') }))
  page = await newPage()
  await page.goto(`http://localhost:${apiPort + 1}/users/${id}`)
  await page.waitForURL('**/signin')
  console.log('  ✓ deep link → SPA fallback → PrivateRoute → /signin')
  await fillSignin(page, email, 'secret123')
  await page.waitForURL(`**/users/${id}`)
  await see(page, email)
  const notFound = await fetch(`http://localhost:${apiPort + 1}/api/nope`)
  if (notFound.status !== 404 || !(await notFound.text()).startsWith('{')) throw new Error('/api/nope is not a JSON 404')
  console.log('  ✓ /api/nope is still a JSON 404')

  console.log('• 3. client on its own origin: VITE_API_URL + CORS_ORIGIN')
  await build('own-origin', `http://localhost:${apiPort + 2}`)
  children.push(await startServer(serverDir, apiPort + 2, { CORS_ORIGIN: 'http://localhost:4211' }))
  server = await preview('own-origin', 4211)
  closers.push(server)
  page = await newPage()
  const apiHosts = new Set()
  page.on('request', (r) => { if (r.url().includes('/api/')) apiHosts.add(new URL(r.url()).host) })
  await page.goto('http://localhost:4211/signin')
  await fillSignin(page, email, 'secret123')
  await page.waitForURL('http://localhost:4211/')
  await page.getByRole('link', { name: 'My Profile' }).click()
  await see(page, email)
  if ([...apiHosts].some((h) => h !== `localhost:${apiPort + 2}`)) throw new Error('API requests went to ' + [...apiHosts])
  console.log('  ✓ every API request went to', [...apiHosts].join(', '))

  console.log('• 3b. the same kind of build against a server without CORS_ORIGIN')
  await build('no-cors', `http://localhost:${apiPort + 3}`)
  children.push(await startServer(serverDir, apiPort + 3))
  server = await preview('no-cors', 4212)
  closers.push(server)
  page = await newPage()
  await page.goto('http://localhost:4212/users')
  await see(page, 'Cannot reach the server')
} catch (err) {
  ok = false
  console.log('FAILED:', err.message.split('\n')[0])
}
for (const c of children) c.kill()
for (const s of closers) await s.close().catch(() => {})
await browser.close()
if (problems.length) { ok = false; console.log('PROBLEMS:\n  ' + problems.join('\n  ')) }
console.log(ok ? 'RESULT: PASS' : 'RESULT: FAIL')
process.exit(ok ? 0 : 1)
