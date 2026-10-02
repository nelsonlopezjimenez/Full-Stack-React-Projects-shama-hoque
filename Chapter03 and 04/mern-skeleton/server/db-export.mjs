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

// db-export.mjs — JSON export of every collection in `mernproject`.
//
// Pure Node (uses the `mongodb` driver bundled under this server's
// node_modules). No MongoDB Database Tools / mongosh required.
//
// NOTE ON FIDELITY: JSON.stringify turns ObjectId and Date into strings, so a
// round-trip through these scripts changes those types. For teaching data that
// is usually fine. If you need lossless _id/date types, use `mongodump`
// instead (see the chat notes / the export/import write-up).
//
// Run from mern-skeleton/server:
//   bash:        MONGODB_URI='mongodb://localhost:27017/?directConnection=true' node db-export.mjs
//   powershell:  $env:MONGODB_URI='mongodb://localhost:27017/?directConnection=true'; node db-export.mjs
// Output: ./dump-json/<collection>.json  (one file per collection)

import { MongoClient } from 'mongodb'
import { mkdir, writeFile } from 'node:fs/promises'

const uri = process.env.MONGODB_URI
  || 'mongodb://localhost:27017/?directConnection=true'
const dbName = process.env.DB_NAME || 'mernproject'
const outDir = process.env.OUT_DIR || 'dump-json'

const client = new MongoClient(uri)
await client.connect()
console.log('connected:', uri)

const db = client.db(dbName)
await mkdir(outDir, { recursive: true })

const collections = await db.listCollections().toArray()
let total = 0
for (const { name } of collections) {
  const docs = await db.collection(name).find().toArray()
  await writeFile(`${outDir}/${name}.json`, JSON.stringify(docs, null, 2))
  total += docs.length
  console.log(`  exported ${docs.length} docs from ${name}`)
}

console.log(`done: ${collections.length} collection(s), ${total} docs -> ${outDir}/`)
await client.close()
process.exit(0)
