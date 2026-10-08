// Settings shared by the ladder end-to-end checks. Every value can be changed with an
// environment variable (see README.md), so the checks never touch the ports or the database
// of the app you normally run (3000 / 5173 / mernskeleton).
import os from 'node:os'
import path from 'node:path'
import { realpathSync } from 'node:fs'
import { spawn } from 'node:child_process'

const env = process.env

// On Windows the temp folder can come as a short 8.3 path (C:\Users\ABCDEF~1\...). Vite compares
// it with the long real path of the same folder, and from the first stage with pre-bundled
// dependencies (MUI) the dev server then answers 404 for /@vite/client. Always use the long path.
export const tempDir = realpathSync.native(os.tmpdir())

export const apiPort = Number(env.LADDER_API_PORT ?? 3210)
export const vitePort = Number(env.LADDER_VITE_PORT ?? 5210)
export const apiBase = `http://localhost:${apiPort}`
export const mongoUri = env.LADDER_MONGODB_URI ?? 'mongodb://localhost:27017/mernskeleton_ladder?directConnection=true'
export const outDir = env.LADDER_OUT ?? path.join(tempDir, 'ladder-e2e')
const jwtSecret = 'ladder-e2e-secret-0123456789abcdef'

// LADDER_BROWSER: msedge (default) | chrome | chromium | a path to a browser executable.
// msedge / chrome use the browser installed on this computer; chromium needs
// `npx playwright-core install chromium` once.
export const launchBrowser = (chromium) => {
  const browser = env.LADDER_BROWSER ?? 'msedge'
  const headless = !env.LADDER_HEADED
  if (/[\\/]/.test(browser)) return chromium.launch({ executablePath: browser, headless })
  if (browser === 'chromium') return chromium.launch({ headless })
  return chromium.launch({ channel: browser, headless })
}

// Starts `node server.js` of a ladder stage on `port` and waits for "Server started".
export const startServer = async (serverDir, port, extraEnv = {}) => {
  const child = spawn(process.execPath, ['server.js'], {
    cwd: serverDir,
    env: { ...env, PORT: String(port), MONGODB_URI: mongoUri, JWT_SECRET: jwtSecret, ...extraEnv }
  })
  let output = ''
  child.stdout.on('data', (d) => { output += d })
  child.stderr.on('data', (d) => { output += d })
  for (let i = 0; i < 100 && !output.includes('Server started'); i++) {
    if (child.exitCode !== null) break
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
  if (!output.includes('Server started')) {
    child.kill()
    throw new Error(`server on port ${port} did not start (is MongoDB running?):\n${output}`)
  }
  return child
}
