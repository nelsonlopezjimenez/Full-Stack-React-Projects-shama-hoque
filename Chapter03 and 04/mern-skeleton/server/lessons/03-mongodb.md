# Stage 03 — MongoDB and Mongoose

**Branch:** `teach/ch03-server-03-mongodb`

## Goal

Users survive a restart, and bad data is refused.

## New ideas

- **MongoDB** stores *documents* (JSON-like objects) in *collections*. Our users go to the collection
  `users` in the database `mernskeleton`.
- **Mongoose** is the library between Express and MongoDB:
  - a **schema** lists the fields and their rules (`required`, `trim`, `match`, `unique`);
  - a **model** (`User`) is the schema plus its collection, with methods like `find()` and `save()`.
- **`async` / `await`.** A database answers *later*. `await` waits for the answer without blocking
  the server.
- **Top-level `await`.** The server connects to the database first and only then calls `listen()`.
- **`_id`.** MongoDB gives every document a unique id such as `66fb…e1`, an *ObjectId*.

## What changed

| File | What |
|---|---|
| `package.json` | new dependency `mongoose` |
| `server.js` | connection, `UserSchema`, `User` model, both routes rewritten with `async`/`await` |
| `api.http` | requests 4–6: invalid data, a duplicate email, a second user |

## Try it

You need a running MongoDB on `localhost:27017` (local install, Docker, or change `mongoUri` to an
Atlas URL).

1. `npm install` (for mongoose), then `npm run dev`. The terminal says "Connected to MongoDB".
2. Send request 3, save `server.js` to restart, send request 2: **Ann is still there.**
3. Send request 4 (empty body). The schema refuses it, but the answer is a **500** HTML page with a
   long stack trace. Read it: the real message, "Name is required.", is in there somewhere.
4. Send request 5 (Ann again). Another 500: `E11000 duplicate key error`.
5. Stop MongoDB and start the server: it prints the problem and exits instead of starting half-working.

Steps 3 and 4 show that the *data* is safe now, but the *answers* are bad. A client cannot read an
HTML page with a stack trace, and 500 means "the server failed" when really the client sent bad data.
Stage 08 turns these into clear JSON answers with status 400.

## Look inside the database

With MongoDB Compass or the VS Code MongoDB extension, open `mernskeleton → users`. Each user has
`_id`, `name`, `email`, `created` and `__v` (Mongoose's version counter).

## Exercise

Add `lowercase: true` to the email field, create `ANN2@TEST.IO`, and look at how it is stored.
