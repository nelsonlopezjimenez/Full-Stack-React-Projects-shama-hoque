# Chapter 03 teaching ladder (server) — log

Plan: [ch03-teaching-ladder-checklist.md](ch03-teaching-ladder-checklist.md)

How each stage was checked: the stage was copied (without `node_modules` and `.env`) into a scratch folder that
shares one `node_modules`, started on port **3210** with its own database **`mernskeleton_ladder`**
(so the real `mernskeleton` data and the servers on 3000/3100 were not touched), and a small `fetch`
script sent the stage's requests and compared status codes and bodies.

---

## Stage 01 — hello (`teach/ch03-server-01-hello`)

- **Changed:** first commit removes the book's code (keeps `LICENSE.md`, adds a ladder README).
  Second commit: `server/` with `package.json` (express only), `.gitignore`, `server.js` (`GET /`),
  `api.http`, `README.md`, `lessons/01-hello.md`.
- **Why:** start from nothing, so every later file has a reason to appear.
- **Verified:** `GET /` → 200 with the text; `GET /abc` → 404 "Cannot GET /abc".
- **Surprises:** the migration branch left untracked `server/.env`, `server/node_modules`,
  `client/` (dist, node_modules, .env) and a root `node_modules/` in the working folder. They are
  local files, not part of any commit, so they were left alone. Always `git add` specific paths.
- **Lock files:** each stage's `package-lock.json` is built from the final lock
  (`npm install --package-lock-only`), so every stage uses the same versions as the final code.

## Stage 02 — memory-users (`teach/ch03-server-02-memory-users`)

- **Changed:** `server.js` gets `express.json()`, a `users` array, `GET /api/users`, `POST /api/users`
  (201 `{ message }`, the same answer as the final code). `api.http` requests 2–4, lesson 02.
- **Why:** HTTP methods, JSON bodies and status codes without having to learn a database at the same time.
- **Verified:** empty list → `[]`; two POSTs → 201; list has both, the second one without name/email.

## Stage 03 — mongodb (`teach/ch03-server-03-mongodb`)

- **Changed:** `mongoose` dependency; `server.js` connects with top-level `await` + `User.init()`,
  defines `UserSchema` (the final schema without password fields) and the `User` model; both routes
  use `async`/`await`. `api.http` requests 4–6, lesson 03.
- **Why:** persistence and schema rules. No error handling yet on purpose: the HTML 500s are the
  reason for stage 08.
- **Verified:** create → 201; `{}` → 500 HTML containing "Name is required."; duplicate → 500
  HTML containing "E11000"; list → 2 users, no `__v` (thanks to `.select`). Express 5's default
  handler prints the stack trace in the terminal, as the lesson says.
- **Noticed:** `POST {"created": "2000-01-01"}` is accepted by `new User(req.body)`. The final code
  does the same for sign-up (only update has an allow-list); left as is, matches the target.

## Stage 04 — read-one (`teach/ch03-server-04-read-one`)

- **Changed:** `GET /api/users/:userId` with `findById` and a JSON 404. `api.http` 7–10 (stores the
  first user's id with `# @name list`), lesson 04 (explains why "list all" comes first).
- **Verified:** read → 200; valid unknown id → 404 `{ error: "User not found" }`; `not-an-id` → 500
  HTML with CastError (fixed in 08).

## Stage 05 — delete (`teach/ch03-server-05-delete`)

- **Changed:** `DELETE /api/users/:userId` (`findById`, 404, `deleteOne()`, answers the deleted
  user like the final code). `api.http` 11–13 (the id is pasted by hand on purpose), lesson 05.
- **Verified:** delete → 200 with the user; again → 404; read afterwards → 404.

## Stage 06 — update (`teach/ch03-server-06-update`)

- **Changed:** `PATCH /api/users/:userId` with a naive `Object.assign(user, req.body, { updated })`
  and `save()`. `api.http` 14–15, lesson 06 with the full REST/CRUD table and a "look back" at the
  158-line `server.js`.
- **Verified:** PATCH name → 200 with `updated`; email unchanged; invalid email → 500 HTML;
  `{ "created": "1990-01-01" }` → 200 and accepted (the mass-assignment hole, on purpose, for stage 15);
  unknown id → 404.

## Stage 07 — split (`teach/ch03-server-07-split`)

Every step was checked with the same CRUD regression (hello, create, invalid create, list, read,
read 404, patch, patch 404, delete, delete 404): the answers must not change while the code moves.

- **07a config:** `config/config.js` (`port`, `mongoUri`), `.env.example`, npm scripts with
  `--env-file-if-exists=.env`; `server.js` uses `config`. Lesson 07 (why split + step a).
  Verified: regression passes; a `.env` with `PORT=3211` is picked up by `--env-file-if-exists`.
  **Deliberate difference from the migration:** the default database in `config.js` is
  `mernskeleton` (the migration's default was the book's `mernproject`, the Chapter 5 database,
  although its `.env.example` already said `mernskeleton`).
- **07b model:** schema + model moved verbatim to `models/user.model.js` (`export default`).
  Verified: regression passes.
- **07c controllers:** handlers named and moved to `controllers/user.controller.js` (order and
  export as in the final file); the 404 lookup is still copied in read/update/remove on purpose.
  `server.js` down to 66 lines. Verified: regression passes.
- **07d routes:** `routes/user.routes.js` with `express.Router()` + `router.route()`, mounted with
  `app.use('/', userRoutes)` (as in the final `express.js`). Verified: regression passes.
- **07e express.js / server.js:** `express.js` builds and exports the app (json + routes);
  `server.js` only connects and listens. The hello route on `/` is removed (the final code has none);
  `api.http` request 1 now expects 404. Verified: regression passes, `GET /` → 404.
- **07f userByID:** middleware in the controller (final form, without the `router.param`
  note, which arrives in stage 10 together with `requireSignin`); routes list
  `userByID` before read/update/remove; the three copies are gone. README gets the layout.
  Verified: regression passes (404s now come from `userByID`).

## Stage 08 — errors (`teach/ch03-server-08-errors`)

- **Changed:** `express.js` gets the `/api` JSON 404 and the central error handler (the final one
  without the `UnauthorizedError` branch, which comes with JWT in stage 13; `console.error` until the
  logger in stage 17). `helpers/dbErrorHandler.js` copied from the final code. `server.js`: listen
  error callback. Controller comments explain the missing try/catch. `api.http` 4/5/10/15 → 400,
  new 16 (unknown route) and 17 (broken JSON). Lesson 08 starts with a before/after table.
- **Verified:** `{}` → 400 "Email is required. Name is required."; duplicate → 400 "Email already
  exists"; `not-an-id` → 400; invalid email on PATCH → 400; `/api/nope` → JSON 404; broken JSON → JSON
  400; a second instance on the same port exits with code 1 and `EADDRINUSE`.
- **Surprise:** Mongoose reports validation errors in schema-path order of failure (email before
  name here), so the lesson table shows that order.

## Stage 09 — password-plain (`teach/ch03-server-09-password-plain`)

- **09a password field:** `password` (plain text, `required`, `minlength: 6`; the final code checks the
  length in a `pre('validate')` hook because of the hashing virtual, stage 14). `api.http` sends
  `{{password}}` (`secret1`, as in the final file), new request 18. Lesson 09 part a.
  Verified: missing → 400 "Password is required."; `123` → 400 "...at least 6 characters.";
  list hides it (`.select`); **read and patch return `"password":"secret1"`**, the leak part b fixes.
- **09b toJSON:** schema `toJSON.transform` deletes `password`; controller comments updated.
  Verified: read and patch no longer contain the password.
- **09c sign-in:** `routes/auth.routes.js` (`POST /api/auth/sessions` only) and
  `controllers/auth.controller.js` (`signin` with `===`, taken from the saved simple-auth work),
  mounted in `express.js`. `api.http` 19–22. Lesson 09 part c ends with "HTTP is stateless".
  Verified: sign-in → 200 `{ user }` without the password; wrong password and unknown email → the
  same 401; `{}` and no body → 400; `GET /api/auth/sessions` → JSON 404.

## Stage 10 — cookie-session (`teach/ch03-server-10-cookie-session`)

- **Changed:** `cookie-parser`; `config.env` (as in the final config); `signin` sets the cookie
  `userId` (httpOnly, sameSite strict, secure in production, 1 day); `signout` on
  `DELETE /api/auth/sessions`; hand-written `requireSignin` (cookie present → `req.auth`, else 401)
  in front of `userByID` for read/update/delete, with the final `router.param` note. `api.http`:
  a note on REST Client's cookie jar, requests 23–25 (25 = hand-made cookie). Lesson 10.
- **Verified:** no cookie → 401 (also for an unknown id: 401, not 404, so ids cannot be probed);
  sign-in sets `userId=…; Max-Age=86400; HttpOnly; SameSite=Strict` (no `Secure` in development);
  read/patch with the cookie → 200; **patching Bob as Ann → 200** and a **hand-made cookie can read
  and delete Bob** (the holes for stages 11 and 12); sign-out clears the cookie (Expires 1970); then 401.

## Stage 11 — authorization (`teach/ch03-server-11-authorization`)

- **Changed:** `hasAuthorization` (the final function, comments adapted) on PATCH and DELETE after
  `userByID`; route table says "signed in + owner". `api.http` 26 (Ann edits Bob → 403) and 27
  (hand-made cookie with Bob's id → 200). Lesson 11 (401 vs 403, the chain as a checklist).
- **Verified:** the stage 10 script with 403 expected for Ann → Bob: all pass; a hand-made cookie with
  Bob's id still reads and deletes Bob (fixed in 12); cookie `userId=hello` → PATCH 403
  (`ObjectId.equals('hello')` is false, no crash), GET 200 (read only needs *a* cookie: the exercise
  of lesson 10).

## Stage 12 — signed-cookie (`teach/ch03-server-12-signed-cookie`)

- **Changed:** `config.cookieSecret` (`COOKIE_SECRET`, dev fallback), `.env.example`,
  `cookieParser(config.cookieSecret)` (so `express.js` now imports `config`, as in the final file),
  `signed: true` + `req.signedCookies`. `api.http` 25/27 → 401. Lesson 12 (signed ≠ encrypted, what is
  still missing → JWT).
- **Verified:** stage 10 script with stage-12 expectations (hand-made cookies → 401): all pass; the cookie
  looks like `userId=s%3A<id>.<signature>`; a genuine cookie → 200; the same cookie with one character
  of the id changed → 401.

## Stage 13 — jwt-cookie (`teach/ch03-server-13-jwt-cookie`)

- **Changed:** `jsonwebtoken` + `express-jwt`; config/`.env.example`: `JWT_SECRET`, `JWT_EXPIRES_IN`,
  `JWT_COOKIE_MAX_AGE_MS` replace `COOKIE_SECRET`; `cookieParser()` without a secret (and `express.js`
  drops the `config` import again until stage 18); `signin` signs a token and sets cookie `t`
  + returns `{ token, user }`; **`getToken`: cookie `t` first, then `Authorization: Bearer` (D1)**;
  `UnauthorizedError` → 401 in the error handler. `api.http`: 19 stores the token, 23/25/27 new 401
  texts, 28 header-only. Lesson 13.
- **Verified:** no token → 401 "No authorization token was found"; sign-in → cookie `t=ey…; Max-Age=86400;
  HttpOnly; SameSite=Strict`, payload `{ _id, iat, exp }` with exp − iat = 86400; cookie → read/patch own
  200, Bob 403; header only → 200; `t=<id>` → 401 "jwt malformed"; expired token in the cookie → 401
  "jwt expired" (so the cookie really is read); token with another secret → 401 "invalid signature";
  `Authorization: Token …` → ignored (401); sign-out clears `t`; then 401.
- **Noted:** when the cookie holds an invalid token, the header is not tried (the cookie wins).
  That is fine for this app (the React client sends both, and both hold the same token).

## Stage 14 — password-hashed (`teach/ch03-server-14-password-hashed`)

- **Changed:** `models/user.model.js` is now the final file, unchanged (scrypt + salt, `password` virtual,
  `pre('validate')` length check, `authenticate`, `toJSON` hides hash and salt). `signin` uses
  `user?.authenticate(password)`. Controller comments. `api.http` 29 (change the password). Lesson 14
  (stolen database, hash ≠ encryption, salt, slow on purpose, delete the old plain-text users).
- **Verified:** the stage 13 JWT script still passes; stored keys are
  `_id,name,email,hashed_password,salt,created,__v` (128-hex hash, 32-hex salt, no `password`); the
  same password gives two different hashes; sign-in/wrong password as before; read hides hash and salt;
  PATCH password → old fails, new works; PATCH a 2-character password → 400; a leftover plain-text
  document → 401 (no crash); **`PATCH {hashed_password, salt}` is accepted and locks the user out**,
  the hole for stage 15.
