// Builds the comment-free copy of the teaching ladder.
//
//   cd tools && npm install          (once: installs @babel/parser)
//   node tools/make-nc-ladder.mjs    (from anywhere in the repo)
//   node tools/make-nc-ladder.mjs --dry-run   (strip and check, but do not move any branch;
//                                              it still writes objects that `git gc` removes)
//
// For every branch teach/ch03-server-NN-* and then teach/ch03-client-NN-* (in that order) it
// writes ONE commit on branch teach-nc/<same name>, whose files are the files of the teach/
// branch with all code comments removed. Each teach-nc commit's parent is the previous
// teach-nc commit, so `git diff teach-nc/A teach-nc/B` shows the same lesson without comments.
// The first one starts where teach/ch03-server-01 left main.
//
// Run it again after fixing a stage (and `git rebase --update-refs`) on the teach/ series.
// Nobody edits teach-nc branches by hand. Commit dates and authors are copied from the source
// commits, so a run without changes produces the same commit ids and moves nothing.
//
// Removed: //, /* */ and JSX {/* */} comments in .js/.jsx/.mjs/.cjs; <!-- --> in .html;
// "# ..." lines in .env.example, .gitignore and .http files (REST Client's "###" separators and
// "# @name"-style directives stay). Markdown (README, lessons) is documentation and stays.
// Every stripped JavaScript file is parsed again and must give the same syntax tree.

import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { parse } from '@babel/parser'

const SERIES = ['teach/ch03-server-', 'teach/ch03-client-']
const FOLDER = 'Chapter03 and 04/mern-skeleton/'
const DRY_RUN = process.argv.includes('--dry-run')

const git = (args, { input, env } = {}) =>
  execFileSync('git', args, { input, env: { ...process.env, ...env }, maxBuffer: 1 << 28 })
const gitText = (args, opts) => git(args, opts).toString('utf8').trim()

// ---------- stripping ----------

// Remove the character ranges, then drop every line that held only removed text.
const removeRanges = (src, ranges) => {
  const mask = new Uint8Array(src.length)
  for (let [start, end] of ranges) {
    while (start > 0 && (src[start - 1] === ' ' || src[start - 1] === '\t')) start--
    mask.fill(1, start, end)
  }
  let out = ''
  let lineStart = 0
  while (lineStart < src.length) {
    let nl = src.indexOf('\n', lineStart)
    if (nl === -1) nl = src.length
    let kept = ''
    let removedAny = false
    for (let i = lineStart; i < nl; i++) {
      if (mask[i]) removedAny = true
      else kept += src[i]
    }
    if (!(removedAny && kept.trim() === '')) out += kept.replace(/[ \t]+$/, '') + (nl < src.length ? '\n' : '')
    lineStart = nl + 1
  }
  return out
}

// Tidy what the removed lines leave behind: no blank line right after an opening bracket or
// before a closing one, at most one blank line in a row, none at the start of the file.
const tidy = (s) =>
  s.replace(/([{(\[])\n(?:[ \t]*\n)+/g, '$1\n')
    .replace(/\n(?:[ \t]*\n)+([ \t]*[})\]])/g, '\n$1')
    .replace(/\n(?:[ \t]*\n){2,}/g, '\n\n')
    .replace(/^(?:[ \t]*\n)+/, '')

const parseJs = (src) =>
  parse(src, { sourceType: 'module', plugins: ['jsx'], allowReturnOutsideFunction: true })

const walk = (node, visit) => {
  if (!node || typeof node.type !== 'string') return
  visit(node)
  for (const key of Object.keys(node)) {
    if (key === 'loc' || key.endsWith('Comments')) continue
    const value = node[key]
    if (Array.isArray(value)) value.forEach((child) => walk(child, visit))
    else if (value && typeof value.type === 'string') walk(value, visit)
  }
}

const stripJs = (src) => {
  const ast = parseJs(src)
  const containers = []
  walk(ast.program, (n) => {
    if (n.type === 'JSXExpressionContainer' && n.expression.type === 'JSXEmptyExpression') {
      containers.push([n.start, n.end])
    }
  })
  const inside = (c) => containers.some(([s, e]) => c.start >= s && c.end <= e)
  const ranges = [...containers, ...ast.comments.filter((c) => !inside(c)).map((c) => [c.start, c.end])]
  return tidy(removeRanges(src, ranges))
}

const stripHtml = (src) => {
  const ranges = [...src.matchAll(/<!--[\s\S]*?-->/g)].map((m) => [m.index, m.index + m[0].length])
  return tidy(removeRanges(src, ranges))
}

const stripHashLines = (src) => {
  const ranges = []
  for (const m of src.matchAll(/^[ \t]*#.*$/gm)) {
    if (/^[ \t]*###/.test(m[0]) || /^[ \t]*#[ \t]*@/.test(m[0])) continue
    ranges.push([m.index, m.index + m[0].length])
  }
  return tidy(removeRanges(src, ranges))
}

const stripperFor = (file) => {
  const base = path.posix.basename(file)
  if (/\.(m|c)?jsx?$/.test(base)) return stripJs
  if (base.endsWith('.html')) return stripHtml
  if (base === '.env.example' || base === '.gitignore' || base.endsWith('.http')) return stripHashLines
  return null
}

// Same program? Compare the syntax trees without positions, comments ({/* */} included) and
// the whitespace-only JSX text that sits between elements on separate lines.
const isJsxComment = (v) => v?.type === 'JSXExpressionContainer' && v.expression?.type === 'JSXEmptyExpression'
const isJsxLineBreak = (v) => v?.type === 'JSXText' && /^\s*$/.test(v.value) && v.value.includes('\n')
const shape = (src) =>
  JSON.stringify(parseJs(src).program, (key, value) => {
    if (['start', 'end', 'loc', 'range', 'comments', 'leadingComments', 'trailingComments',
      'innerComments', 'parenStart', 'trailingComma'].includes(key)) return undefined
    if (Array.isArray(value)) return value.filter((v) => !isJsxComment(v) && !isJsxLineBreak(v))
    return value
  })

// ---------- branches ----------

const blobCache = new Map()
const strippedBlob = (sha, file, strip) => {
  if (blobCache.has(sha)) return blobCache.get(sha)
  const src = git(['cat-file', 'blob', sha]).toString('utf8')
  const out = strip(src)
  if (strip === stripJs) {
    const [before, after] = [shape(src), shape(out)]
    if (before !== after) {
      let i = 0
      while (before[i] === after[i]) i++
      throw new Error(`stripping changed the code of ${file} (${sha}):\n` +
        `  before: …${before.slice(i - 80, i + 80)}…\n  after:  …${after.slice(i - 80, i + 80)}…`)
    }
  }
  const result = { sha: out === src ? sha : gitText(['hash-object', '-w', '--stdin'], { input: out }), changed: out !== src }
  blobCache.set(sha, result)
  return result
}

// For other scripts: the stripped text of one file, or null when the file type is not stripped.
export const stripFile = (file, src) => {
  const strip = stripperFor(file)
  return strip ? strip(src) : null
}

const main = () => {
  process.chdir(gitText(['rev-parse', '--show-toplevel']))
  const branches = SERIES.flatMap((prefix) =>
    gitText(['for-each-ref', '--format=%(refname:short)', `refs/heads/${prefix}*`]).split('\n').filter(Boolean).sort())
  if (!branches.length) throw new Error('no teach/ branches found')

  const base = gitText(['merge-base', 'main', branches[0]])
  const tmp = mkdtempSync(path.join(tmpdir(), 'nc-ladder-'))
  const index = path.join(tmp, 'index')
  let parent = base
  let moved = 0

  try {
    for (const branch of branches) {
      const source = gitText(['rev-parse', branch])
      const env = { GIT_INDEX_FILE: index }
      git(['read-tree', source], { env })
      const entries = git(['ls-tree', '-r', '-z', source, '--', FOLDER]).toString('utf8').split('\0').filter(Boolean)
      const updates = []
      for (const entry of entries) {
        const [meta, file] = entry.split('\t')
        const [mode, type, sha] = meta.split(' ')
        const strip = type === 'blob' && stripperFor(file)
        if (!strip) continue
        const result = strippedBlob(sha, file, strip)
        if (result.changed) updates.push(`${mode} ${result.sha}\t${file}`)
      }
      if (updates.length) git(['update-index', '--index-info'], { env, input: updates.join('\n') + '\n' })
      const tree = gitText(['write-tree'], { env })

      const [subject, an, ae, ad, cn, ce, cd] = gitText(['log', '-1', '--format=%s%x00%an%x00%ae%x00%aI%x00%cn%x00%ce%x00%cI', source]).split('\0')
      const message = `${subject} (no comments)\n\nGenerated by tools/make-nc-ladder.mjs from ${branch} at ${source}.\n`
      const commit = gitText(['commit-tree', tree, '-p', parent], {
        input: message,
        env: { GIT_AUTHOR_NAME: an, GIT_AUTHOR_EMAIL: ae, GIT_AUTHOR_DATE: ad, GIT_COMMITTER_NAME: cn, GIT_COMMITTER_EMAIL: ce, GIT_COMMITTER_DATE: cd }
      })

      const target = branch.replace(/^teach\//, 'teach-nc/')
      let current = ''
      try { current = gitText(['rev-parse', '--verify', '--quiet', `refs/heads/${target}`]) } catch {}
      const status = current === commit ? 'unchanged' : DRY_RUN ? 'would move' : current ? 'moved' : 'created'
      if (current !== commit) {
        if (!DRY_RUN) git(['update-ref', `refs/heads/${target}`, commit])
        moved++
      }
      console.log(`${status.padEnd(10)} ${target}  ${commit.slice(0, 7)}  (${updates.length} files without comments)`)
      parent = commit
    }
  } finally {
    rmSync(tmp, { recursive: true, force: true })
  }
  console.log(`\n${branches.length} stages, ${blobCache.size} distinct files checked, ${moved} branches ${DRY_RUN ? 'would move' : 'moved'}.`)
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main()
