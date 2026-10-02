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

// Option A — VERIFY (read-only): which user's password is one of my candidates?
//
// Nothing here is "cracking": for each user we read the salt that is ALREADY
// stored in their document and recompute the HMAC-SHA1 exactly the way the app
// does. Because every user has a different salt, the same word hashes to a
// different value per user — which is why a precomputed table is useless.
//
// Run from the mern-skeleton/server folder (so ./models/user.model resolves):
//   bash:        MONGODB_URI='mongodb://localhost:27017/mernproject?directConnection=true' node verify-password.mjs
//   powershell:  $env:MONGODB_URI='mongodb://localhost:27017/mernproject?directConnection=true'; node verify-password.mjs
// If MONGODB_URI is unset it falls back to localhost/mernproject.

import mongoose from 'mongoose'
import User from './models/user.model.js'

const uri = process.env.MONGODB_URI
  || 'mongodb://localhost:27017/mernproject?directConnection=true'

// The passwords you vaguely remember. Add/remove freely.
const candidates = ['password', 'Password', 'Pa55word']

await mongoose.connect(uri)
console.log('connected:', uri, '\n')

const users = await User.find({}, 'name email salt hashed_password').exec()
console.log(`checking ${candidates.length} candidate(s) against ${users.length} user(s)\n`)

let hits = 0
for (const u of users) {
  // user.authenticate(x) === (encryptPassword(x) === hashed_password),
  // and encryptPassword uses THIS user's stored salt. No salt to "remember".
  const match = candidates.find((c) => u.authenticate(c))
  if (match) {
    hits++
    console.log(`  MATCH  ${u.email}  ->  "${match}"`)
  }
}

if (!hits) console.log('  no candidate matched any user — try more words in `candidates`')

await mongoose.disconnect()
process.exit(0)
