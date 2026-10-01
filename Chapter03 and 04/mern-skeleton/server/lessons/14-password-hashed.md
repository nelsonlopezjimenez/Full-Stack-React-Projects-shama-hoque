# Stage 14 — Never store passwords: hashing

**Branch:** `teach/ch03-server-14-password-hashed`

## Goal

The database no longer contains any password, only a **salted hash** of it. Sign-in still works.

## Why: the stolen database

Open the `users` collection from stage 13 in Compass: every password is right there. Databases and
backups do get stolen. With plain text the thief can sign in as everyone immediately, and because people
reuse passwords, also into their email and their bank.

## New ideas

- **Hash.** A one-way function: `scrypt("secret1")` always gives the same long hex string, and there is
  no way back from the string to the password. To check a password you hash the typed one and compare
  the two hashes.
- **Hashing ≠ encryption.** Encryption can be reversed with a key, and a hash cannot. Passwords must
  be *hashed*.
- **Salt.** A random value per user, stored next to the hash and mixed into it. Two users with the same
  password get different hashes, and precomputed "hash → password" tables become useless.
- **Slow on purpose.** `scrypt` takes a few dozen milliseconds per check and uses a lot of memory.
  That is nothing for one sign-in, but brute-forcing billions of guesses becomes too expensive.
  Fast hashes such as SHA-1 (used in the book) are the wrong tool. bcrypt and argon2 are
  the other common choices; `scrypt` is built into Node (`node:crypto`).
- **`timingSafeEqual`.** It compares in constant time, so response times do not reveal how many
  bytes matched.
- **A `password` virtual.** A *virtual* is a schema property that is not stored. Writing
  `user.password = 'secret1'` runs a setter that creates a salt and stores `hashed_password`.
  Sign-up (`new User(req.body)`) and PATCH (`Object.assign`) both go through it, so no route
  changes.
- **`authenticate(plainText)`.** A schema *method*: `user.authenticate('secret1')` → `true`/`false`.
- **`pre('validate')` hook.** It checks the length of the *typed* password (the hash is always long).

## What changed

| File | What |
|---|---|
| `models/user.model.js` | `hashed_password` + `salt` instead of `password`; the virtual, the hook, `authenticate`, `encryptPassword`, `makeSalt`; `toJSON` hides hash and salt |
| `controllers/auth.controller.js` | `user?.authenticate(password)` instead of `===` |
| `controllers/user.controller.js` | comments only |
| `api.http` | 29: change the password |

## Try it

1. **Delete the old users first.** They have a plain `password` and no hash, so they can never sign in
   again. In `mongosh`: `use mernskeleton` then `db.users.deleteMany({})` (or delete them in Compass).
2. Sign up (request 3) and look at the document: `hashed_password` (128 hex characters) and `salt`,
   with no `password` field anywhere.
3. Create a second user with the **same** password: compare the two hashes. They are different
   because each user has their own salt.
4. Sign in (19), wrong password (20). Same answers as before.
5. Request 29 changes the password; sign in with `secret2`.

In a real app with existing users you would not delete them. You would ask them to reset their
password, or re-hash each password the next time its owner signs in successfully.

## One more problem

Send `PATCH { "hashed_password": "x", "salt": "y" }` for your own user, then try to sign in. The update
copied fields that a client must never touch. That is stage 15.

## Exercise

In `node`, run:
```js
const c = require('node:crypto')
console.time('scrypt'); c.scryptSync('secret1', 'salt', 64); console.timeEnd('scrypt')
console.time('sha1'); c.createHash('sha1').update('secret1').digest('hex'); console.timeEnd('sha1')
```
How many times slower is scrypt? Why is that good here?
