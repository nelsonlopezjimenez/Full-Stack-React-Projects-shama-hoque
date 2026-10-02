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

// Option B — RESET (writes): set a known password for ONE user on your own DB.
//
// This is the usual answer to "I'm locked out of my own dev database." We don't
// recover the old password at all — we assign a new one. Setting user.password
// fires the model's `password` virtual, which regenerates BOTH salt and
// hashed_password, so the account ends up in exactly the state the signup flow
// would produce.
//
// Run from the mern-skeleton/server folder. Pass the target email + new password:
//   bash:        MONGODB_URI='mongodb://localhost:27017/mernproject?directConnection=true' \
//                  node reset-password.mjs you@example.com 'newSecret123'
//   powershell:  $env:MONGODB_URI='mongodb://localhost:27017/mernproject?directConnection=true'
//                node reset-password.mjs you@example.com 'newSecret123'
// (password must be >= 6 chars, per the model's validation)

import mongoose from 'mongoose'
import User from './models/user.model.js'

const uri = process.env.MONGODB_URI
  || 'mongodb://localhost:27017/mernproject?directConnection=true'

const [email, newPassword] = process.argv.slice(2)
if (!email || !newPassword) {
  console.error('usage: node reset-password.mjs <email> <newPassword>')
  process.exit(1)
}

await mongoose.connect(uri)
console.log('connected:', uri)

const user = await User.findOne({ email }).exec()
if (!user) {
  console.error(`no user with email ${email}`)
  await mongoose.disconnect()
  process.exit(1)
}

user.password = newPassword   // virtual setter -> new salt + new hashed_password
await user.save()             // runs the >=6 char validation

console.log(`reset password for ${user.email}; you can now log in with the new password`)
await mongoose.disconnect()
process.exit(0)
