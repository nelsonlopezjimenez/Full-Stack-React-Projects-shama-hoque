# Stage 09 — Passwords and signing in (plain text, for now)

**Branch:** `teach/ch03-server-09-password-plain` (three commits: a, b, c)

## Goal

Users get a password, and `POST /api/auth/sessions` checks it. That is **authentication**: proving who
you are.

> **Warning.** In this stage the password is stored **as plain text**, which a real app must never do.
> It keeps the first sign-in lesson small. Stage 14 replaces it with a salted hash and explains why.

## a) A `password` field, and a leak

- The schema gets `password` with two rules: `required` and `minlength: 6`.
- Sign-up (`POST /api/users`) now needs a password. Requests 3, 5, 6 and 11 in `api.http` send one.

Try: create a user, then send request 8 (read one user). **The password is in the answer.**
`GET /api/users` does not show it, because `list` uses `.select('name email updated created')`, but
`read`, `update` and `remove` send the whole document. Every route would have to remember to hide it.

## b) Hide the password everywhere: `toJSON`

- `res.json(user)` calls `user.toJSON()` behind the scenes. The schema option
  `toJSON: { transform }` deletes `password` from that copy.
- The password stays in the database (sign-in needs it). It just never goes out in an answer, from
  **any** route, including ones written later.

Try: send request 8 again. The password is gone.

## c) Sign in: `POST /api/auth/sessions`

- A new pair of files, `routes/auth.routes.js` and `controllers/auth.controller.js`, following the
  pattern from stage 07. Nothing in the user files changes. That is the payoff of the split.
- **Why `POST /api/auth/sessions`?** Signing in *creates a session*: the URL is a noun, the method is
  the verb. Signing out will be `DELETE` on the same URL (stage 10).
- `signin`:
  1. 400 if email or password is missing;
  2. `User.findOne({ email })`;
  3. **401** if there is no such user **or** the password differs, with the **same message** for both.
     A different message for "no such email" would let anyone find out who has an account;
  4. 200 with the public fields only.

| Status | Meaning |
|---|---|
| 400 Bad Request | the request itself is incomplete or invalid |
| 401 Unauthorized | "I don't know who you are" (no proof, or wrong proof) |

## Try it

Requests 19–22. Then try request 8: it still works without signing in, for any user. The
server checked Ann's password in request 19 and forgot it right after. HTTP is **stateless**: every
request stands alone. Stage 10 makes the server remember who signed in.

## Exercise

Make sign-in ignore upper/lower case in the email (`findOne({ email: email.toLowerCase() })`). Why
does that only work if sign-up stores emails in lower case too? (See `lowercase: true`, stage 03.)
