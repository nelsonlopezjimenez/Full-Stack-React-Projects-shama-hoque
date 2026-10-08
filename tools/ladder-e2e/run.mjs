// node tools/ladder-e2e/run.mjs [--series teach|teach-nc] [--stages 01,05-07] [--no-suites] [--keep]
//
// Checks the client ladder stage by stage, without touching your working folder:
//   1. makes a temporary git worktree (a second checkout of this repo) in the system temp folder
//   2. installs the server's and the final client's packages there (npm ci)
//   3. starts the stage-19 server on LADDER_API_PORT with its own database
//   4. for every client stage: checks it out, runs check-stage.mjs (build + browser scenario);
//      for stage 15 and later also check-production.mjs once (on the last stage checked)
//   5. runs the committed test suites of the last stage (server: node --test, client: vitest)
//   6. stops everything and removes the worktree (--keep leaves it, to look around)
//
// Branches are taken from local branches, or from origin/ when there are no local ones
// (a fresh clone). --series teach-nc checks the comment-free copy.
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import path from 'node:path'
import { mongoUri, apiPort, outDir, tempDir, startServer } from './config.mjs'

const args = process.argv.slice(2)
const option = (name, fallback) => {
  const i = args.indexOf(name)
  return i === -1 ? fallback : args[i + 1]
}
const series = option('--series', 'teach')
const wanted = option('--stages', '')
const runSuites = !args.includes('--no-suites')
const keep = args.includes('--keep')
const FOLDER = 'Chapter03 and 04/mern-skeleton'
const here = import.meta.dirname

const git = (...a) => execFileSync('git', a, { encoding: 'utf8' }).trim()
const repo = git('rev-parse', '--show-toplevel')
process.chdir(repo)

const findBranches = (pattern) => {
  for (const prefix of ['refs/heads/', 'refs/remotes/origin/']) {
    const found = git('for-each-ref', '--format=%(refname)', `${prefix}${series}/${pattern}`).split('\n').filter(Boolean).sort()
    if (found.length) return found
  }
  return []
}
const stageOf = (ref) => ref.match(/client-(\d+)-/)[1]
const inRange = (nn) => {
  if (!wanted) return true
  const n = Number(nn)
  return wanted.split(',').some((part) => {
    const [from, to = from] = part.split('-').map(Number)
    return n >= from && n <= to
  })
}

const clientRefs = findBranches('ch03-client-*').filter((ref) => inRange(stageOf(ref)))
if (!clientRefs.length) throw new Error(`no ${series}/ch03-client-* branches found (try: git fetch origin)`)
const lastRef = clientRefs.at(-1)

// npm is npm.cmd on Windows, which needs a shell; the paths contain spaces, so quote them.
const npm = (cwd, ...a) => {
  const r = spawnSync(`npm ${a.join(' ')}`, { cwd, shell: true, stdio: 'inherit' })
  if (r.status !== 0) throw new Error(`npm ${a.join(' ')} failed in ${cwd}`)
}

const worktree = mkdtempSync(path.join(tempDir, 'ladder-e2e-wt-'))
rmSync(worktree, { recursive: true })
const clientDir = path.join(worktree, FOLDER, 'client')
const serverDir = path.join(worktree, FOLDER, 'server')
const results = []
let server
let cleanedUp = false
const cleanUp = () => {
  if (cleanedUp) return
  cleanedUp = true
  server?.kill()
  if (keep) console.log(`\nworktree kept: ${worktree}  (remove it with: git worktree remove --force "${worktree}")`)
  else {
    try { git('worktree', 'remove', '--force', worktree) } catch { git('worktree', 'prune') }
  }
}
// Ctrl+C: stop the server and remove the worktree before exiting.
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => { cleanUp(); process.exit(130) })

try {
  console.log(`worktree ${worktree}\nseries ${series}, ${clientRefs.length} stages, database ${mongoUri}\n`)
  git('worktree', 'add', '--detach', worktree, lastRef)

  // node_modules is git-ignored, so it stays in place while the worktree switches stages.
  // The last stage has every package any earlier stage uses, in the same versions.
  console.log('installing packages (server, then client) ...')
  npm(serverDir, 'ci', '--no-audit', '--no-fund')
  npm(clientDir, 'ci', '--no-audit', '--no-fund')

  // Every client stage carries the same, finished server.
  server = await startServer(serverDir, apiPort)
  console.log(`server running on port ${apiPort}\n`)

  for (const ref of clientRefs) {
    const nn = stageOf(ref)
    git('-C', worktree, 'checkout', '--quiet', '--detach', ref)
    console.log(`\n===== ${ref.replace(/^refs\/(heads|remotes)\//, '')}`)
    const r = spawnSync(process.execPath, [path.join(here, 'check-stage.mjs'), clientDir, nn], { stdio: 'inherit', timeout: 300_000 })
    results.push([`stage ${nn}`, r.status === 0])
  }

  if (Number(stageOf(lastRef)) >= 15) {
    console.log('\n===== production builds (on the last stage checked)')
    const r = spawnSync(process.execPath, [path.join(here, 'check-production.mjs'), clientDir, serverDir], { stdio: 'inherit', timeout: 300_000 })
    results.push(['production', r.status === 0])
  }

  if (runSuites) {
    git('-C', worktree, 'checkout', '--quiet', '--detach', lastRef)
    console.log('\n===== committed test suites of the last stage')
    for (const [name, dir] of [['server: node --test', serverDir], ['client: vitest', clientDir]]) {
      const hasTests = JSON.parse(execFileSync('git', ['-C', worktree, 'show', `HEAD:${path.relative(worktree, dir).replaceAll('\\', '/')}/package.json`], { encoding: 'utf8' })).scripts?.test
      if (!hasTests) continue
      const r = spawnSync('npm test', { cwd: dir, shell: true, stdio: 'inherit' })
      results.push([name, r.status === 0])
    }
  }
} finally {
  cleanUp()
}

console.log('\n===== summary')
for (const [name, ok] of results) console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}`)
console.log(`\nbuild output and failure screenshots: ${outDir}`)
process.exit(results.every(([, ok]) => ok) ? 0 : 1)
