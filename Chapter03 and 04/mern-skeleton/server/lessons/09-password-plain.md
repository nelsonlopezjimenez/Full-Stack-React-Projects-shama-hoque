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
