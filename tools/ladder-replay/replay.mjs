// Replays every commit in <base>..<tip> with transformed files, keeping message, author,
// committer and dates. See README.md.
// Usage: node replay.mjs <repo> <base> <tip> <transforms.mjs> [--write]
// Without --write it only reports which rules hit in which commit (and writes the changed files
// to out/ for review). With --write it also creates the new commits and writes mapping.json
// (old commit → new commit). It never moves a branch.
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const [repo, base, tip, transformsFile, flag] = process.argv.slice(2)
if (!transformsFile) {
  console.error('usage: node replay.mjs <repo> <base> <tip> <transforms.mjs> [--write]')
  process.exit(1)
}
const { transform, TARGETS } = await import(pathToFileURL(resolve(transformsFile)).href)
const write = flag === '--write'
const here = dirname(fileURLToPath(import.meta.url))
const outDir = join(here, 'out')
const indexFile = join(here, 'tmp-index')

const git = (args, opts = {}) =>
  execFileSync('git', args, { cwd: repo, encoding: 'utf8', maxBuffer: 64 << 20, ...opts }).trimEnd()
const gitRaw = (args) => execFileSync('git', args, { cwd: repo, maxBuffer: 64 << 20 })

rmSync(outDir, { recursive: true, force: true })
mkdirSync(outDir, { recursive: true })

const commits = git(['rev-list', '--reverse', `${base}..${tip}`]).split('\n')
const blobCache = new Map() // old blob → { blob, hits }
const mapping = {}
let parent = git(['rev-parse', base])
const allHits = new Set()

for (const c of commits) {
  const subject = git(['log', '-1', '--format=%s', c])
  const changes = []
  for (const path of TARGETS) {
    let oldBlob
    try {
      oldBlob = git(['rev-parse', '-q', '--verify', `${c}:${path}`], { stdio: ['ignore', 'pipe', 'ignore'] })
    } catch {
      continue
    }
    if (!blobCache.has(oldBlob)) {
      const raw = gitRaw(['cat-file', 'blob', oldBlob]).toString('utf8')
      const crlf = raw.includes('\r\n')
      const lf = raw.replace(/\r\n/g, '\n')
      const { text, hits } = transform(path, lf)
      let blob = oldBlob
      if (text !== lf) {
        const final = crlf ? text.replace(/\n/g, '\r\n') : text
        blob = git(['hash-object', '-w', '--stdin', '--no-filters'], { input: final })
        writeFileSync(join(outDir, `${oldBlob.slice(0, 7)}-${path.split('/').pop()}`), text)
      }
      blobCache.set(oldBlob, { blob, hits })
      hits.forEach((h) => allHits.add(h))
    }
    const { blob, hits } = blobCache.get(oldBlob)
    if (blob !== oldBlob) changes.push({ path, blob, hits })
  }

  console.log(`${c.slice(0, 7)} ${subject.slice(0, 70)}`)
  for (const ch of changes) console.log(`    ${ch.path.split('/').slice(-2).join('/')}: ${ch.hits.join(', ')}`)

  if (write) {
    const env = { ...process.env, GIT_INDEX_FILE: indexFile }
    git(['read-tree', `${c}^{tree}`], { env })
    for (const ch of changes) {
      const mode = git(['ls-tree', c, '--', ch.path]).split(/\s/)[0]
      git(['update-index', '--cacheinfo', `${mode},${ch.blob},${ch.path}`], { env })
    }
    const tree = git(['write-tree'], { env })
    const fmt = (f) => git(['log', '-1', `--format=${f}`, c])
    // the message exactly as stored: everything after the header's blank line
    const raw = gitRaw(['cat-file', 'commit', c]).toString('utf8')
    const message = raw.slice(raw.indexOf('\n\n') + 2)
    const newCommit = git(['commit-tree', tree, '-p', parent], {
      input: message,
      env: {
        ...process.env,
        GIT_AUTHOR_NAME: fmt('%an'),
        GIT_AUTHOR_EMAIL: fmt('%ae'),
        GIT_AUTHOR_DATE: fmt('%aI'),
        GIT_COMMITTER_NAME: fmt('%cn'),
        GIT_COMMITTER_EMAIL: fmt('%ce'),
        GIT_COMMITTER_DATE: fmt('%cI'),
      },
    })
    mapping[c] = newCommit
    parent = newCommit
  }
}
rmSync(indexFile, { force: true })
console.log('\nrules that hit:', [...allHits].sort().join(', '))
if (write) writeFileSync(join(here, 'mapping.json'), JSON.stringify(mapping, null, 2))
