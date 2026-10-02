/* ############################################################################
   ##                                                                        ##
   ##   !!!  WARNING  —  THIS LIVES ON BRANCH  tools/db-recovery  !!!         ##
   ##                                                                        ##
   ##   The NORMAL selective Gitea sync does NOT send this branch to         ##
   ##   students. But the FORCE EXACT-COPY procedure                         ##
   ##   (chat/gitea-force-sync-from-github.md) copies ALL branches and       ##
   ##   WOULD push this file to students.                                    ##
   ##                                                                        ##
   ##   >>> DELETE tools/db-recovery FROM GITHUB BEFORE ANY FULL EXACT-COPY  ##
   ##       SYNC. Do not merge this branch into main. <<<                    ##
   ##                                                                        ##
   ############################################################################ */

// db-import.mjs — load ./dump-json/<collection>.json files back into `mernproject`.
//
// Pure Node (uses the `mongodb` driver bundled under this server's node_modules).
// Pairs with db-export.mjs. Each collection is CLEARED (deleteMany {}) before
// insert, so this is a clean reload — re-running it is safe and idempotent.
//
// Run from mern-skeleton/server:
//   bash:        MONGODB_URI='mongodb://localhost:27017/?directConnection=true' node db-import.mjs
//   powershell:  $env:MONGODB_URI='mongodb://localhost:27017/?directConnection=true'; node db-import.mjs
// Reads: ./dump-json/*.json

import { MongoClient } from 'mongodb'
import { readdir, readFile } from 'node:fs/promises'

const uri = process.env.MONGODB_URI
  || 'mongodb://localhost:27017/?directConnection=true'
const dbName = process.env.DB_NAME || 'mernproject'
const inDir = process.env.IN_DIR || 'dump-json'

const client = new MongoClient(uri)
await client.connect()
console.log('connected:', uri)

const db = client.db(dbName)
const files = (await readdir(inDir)).filter((f) => f.endsWith('.json'))

let total = 0
for (const file of files) {
  const name = file.replace(/\.json$/, '')
  const docs = JSON.parse(await readFile(`${inDir}/${file}`, 'utf8'))
  await db.collection(name).deleteMany({})          // clean reload
  if (docs.length) await db.collection(name).insertMany(docs)
  total += docs.length
  console.log(`  imported ${docs.length} docs into ${name}`)
}

console.log(`done: ${files.length} file(s), ${total} docs -> ${dbName}`)
await client.close()
process.exit(0)
