// node check-stage.mjs <clientDir> <NN>
// Builds one client stage with `vite build`, starts its own vite.config.js on LADDER_VITE_PORT
// (with /api forwarded to the ladder server on LADDER_API_PORT) and runs scenario sNN from
// scenarios.mjs in a real browser. Fails on a failed step, a page error or a React warning.
// The server must already be running (run.mjs starts it).
import { pathToFileURL } from 'node:url'
import path from 'node:path'
import { chromium } from 'playwright-core'
import * as scenarios from './scenarios.mjs'
import { apiBase, vitePort, outDir, launchBrowser } from './config.mjs'

const [clientDir, stage] = process.argv.slice(2)
if (!clientDir || !stage) {
  console.log('usage: node check-stage.mjs <clientDir> <NN>')
  process.exit(2)
}
const scenario = scenarios[`s${stage}`]
if (!scenario) throw new Error(`no scenario s${stage} in scenarios.mjs`)

// Vite is imported from the stage's own node_modules, so the check uses the stage's versions.
const vite = await import(pathToFileURL(path.join(clientDir, 'node_modules/vite/dist/node/index.js')).href)

console.log(`--- build (stage ${stage})`)
await vite.build({ root: clientDir, logLevel: 'warn', build: { outDir: path.join(outDir, 'dist', stage), emptyOutDir: true } })
console.log('build ok')

// Inline settings override the stage's vite.config.js: another port, and /api to the test server.
const server = await vite.createServer({
  root: clientDir,
  configFile: path.join(clientDir, 'vite.config.js'),
  logLevel: 'error',
  server: { port: vitePort, strictPort: true, proxy: { '/api': apiBase } }
})
await server.listen()

const browser = await launchBrowser(chromium)
const page = await browser.newPage()
const problems = []
const network = []
page.on('pageerror', (e) => problems.push('pageerror: ' + e.message))
page.on('console', (m) => {
  if (m.type() !== 'error' && m.type() !== 'warning') return
  // 4xx answers the scenario provokes on purpose also show up as "Failed to load resource";
  // they are listed below, with their URLs, from the response and requestfailed events.
  if (!m.text().startsWith('Failed to load resource')) problems.push(`console.${m.type()}: ${m.text()}`)
})
const short = (url) => url.replace(`http://localhost:${vitePort}`, '')
page.on('response', (r) => { if (r.status() >= 400) network.push(`${r.status()} ${r.request().method()} ${short(r.url())}`) })
page.on('requestfailed', (r) => network.push(`${r.failure()?.errorText} ${r.method()} ${short(r.url())}`))

const base = `http://localhost:${vitePort}`
const see = async (text) => {
  await page.getByText(text).first().waitFor({ timeout: 8000 })
  console.log('  ✓ sees', JSON.stringify(String(text)))
}
const notSee = async (text) => {
  await page.waitForTimeout(300)
  if (await page.getByText(text).count()) throw new Error('should not see ' + text)
  console.log('  ✓ does not see', JSON.stringify(String(text)))
}
const step = (s) => console.log('•', s)

let ok = true
try {
  // Warm-up: on a fresh install Vite pre-bundles the dependencies (MUI is large) during the
  // first page load, which can take longer than a normal step may wait. Wait once, generously,
  // until React has rendered something and the network is quiet.
  await page.goto(base + '/')
  await page.waitForFunction(() => document.getElementById('root')?.childElementCount > 0, null, { timeout: 120_000 })
  await page.waitForLoadState('networkidle')
  console.log(`--- browser (stage ${stage})`)
  await scenario({ page, base, see, notSee, step, email: `ann.${Date.now()}@test.io` })
} catch (err) {
  ok = false
  const shot = path.join(outDir, `fail-${stage}.png`)
  console.log('FAILED:', err.message.split('\n')[0], `\n  screenshot: ${shot}`)
  await page.screenshot({ path: shot }).catch(() => {})
}
if (network.length) console.log('network errors (expected ones are fine):\n  ' + network.join('\n  '))
if (problems.length) { ok = false; console.log('PROBLEMS:\n  ' + problems.join('\n  ')) }
await browser.close()
await server.close()
console.log(ok ? 'RESULT: PASS' : 'RESULT: FAIL')
process.exit(ok ? 0 : 1)
