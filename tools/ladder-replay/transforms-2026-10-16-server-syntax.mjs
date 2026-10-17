// Ch03 server ladder, 2026-10-16: checklist rows S1, S2 and S5 (current syntax).
// Run over the server AND client ladder (the client stages sit on server stage 19):
//   node tools/ladder-replay/replay.mjs . a28fe85 teach/ch03-client-20-tests tools/ladder-replay/transforms-2026-10-16-server-syntax.mjs

const S = 'Chapter03 and 04/mern-skeleton/server/'

function replaceExact(text, oldStr, newStr, hits, name) {
  if (!text.includes(oldStr)) return text
  const count = text.split(oldStr).length - 1
  if (count !== 1) throw new Error(`${name}: matched ${count} times`)
  hits.push(name)
  return text.replace(oldStr, () => newStr)
}

// S1 + S5: template literal for the default URI; why `||` and not `??` (stages 07a–19)
const MONGO_OLD = `  mongoUri: process.env.MONGODB_URI ||
    process.env.MONGO_HOST ||
    'mongodb://' + (process.env.IP || 'localhost') + ':' +
    (process.env.MONGO_PORT || '27017') +
    '/mernskeleton'`
const MONGO_NEW = `  // [BEGINNER] \`||\` on purpose here, not \`??\`: an empty line like \`MONGODB_URI=\` in .env gives ''
  // and should fall back to the next choice too. The last choice is a template literal: text in
  // backticks, where \${…} puts a value into the text (the book glued the parts together with +).
  mongoUri: process.env.MONGODB_URI ||
    process.env.MONGO_HOST ||
    \`mongodb://\${process.env.IP || 'localhost'}:\${process.env.MONGO_PORT || '27017'}/mernskeleton\``

// S5: NODE_ENV (stages 10–19)
const ENV_OLD = `const env = process.env.NODE_ENV || 'development'`
const ENV_NEW = `// \`||\`, not \`??\`: an empty \`NODE_ENV=\` in .env falls back to 'development' as well.
const env = process.env.NODE_ENV || 'development'`

// S2: events.once instead of a hand-made Promise (stage 19)
const IMPORT_OLD = `import assert from 'node:assert/strict'
`
const IMPORT_NEW = `import assert from 'node:assert/strict'
import { once } from 'node:events'
`
const ONCE_OLD = `  await new Promise((resolve) => server.once('listening', resolve))`
const ONCE_NEW = `  // [BEGINNER] once(emitter, 'event') from node:events returns a Promise for the first such
  // event, so it can be awaited directly (no hand-made \`new Promise\` around server.once).
  await once(server, 'listening')`

export function transform(path, text) {
  const hits = []
  if (path === `${S}config/config.js`) {
    text = replaceExact(text, MONGO_OLD, MONGO_NEW, hits, 'S1-mongoUri')
    text = replaceExact(text, ENV_OLD, ENV_NEW, hits, 'S5-node-env')
  }
  if (path === `${S}tests/4-api.test.js` && text.includes(ONCE_OLD)) {
    text = replaceExact(text, IMPORT_OLD, IMPORT_NEW, hits, 'S2-import')
    text = replaceExact(text, ONCE_OLD, ONCE_NEW, hits, 'S2-once')
  }
  return { text, hits }
}

export const TARGETS = [`${S}config/config.js`, `${S}tests/4-api.test.js`]
