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
