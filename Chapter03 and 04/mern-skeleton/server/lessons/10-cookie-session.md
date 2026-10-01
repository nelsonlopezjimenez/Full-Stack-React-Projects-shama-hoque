# Stage 10 — Remember who signed in: a cookie

**Branch:** `teach/ch03-server-10-cookie-session`

## Goal

After signing in, the next requests are recognised, and reading, changing or deleting a user requires
a sign-in.

## New ideas

- **Cookies.** The server's answer says `Set-Cookie: userId=66fb…; HttpOnly; SameSite=Strict`. The
  browser stores it and sends `Cookie: userId=66fb…` with every later request to this server.
  This is how a stateless protocol "remembers".
- **`cookie-parser`** turns the `Cookie` header into the object `req.cookies`.
- **Cookie options.** `httpOnly` (page JavaScript cannot read it), `sameSite: 'strict'` (not sent
  when another site starts the request), `secure` (HTTPS only, in production), `maxAge`.
- **`requireSignin`** is a middleware *guard*: no cookie → **401**, otherwise
  `req.auth = { _id }` and `next()`.
- **Sign out = `DELETE /api/auth/sessions`.** It clears the cookie. It is not a GET, because a GET must
  never change anything (browsers prefetch links).
- **Order matters.** `requireSignin, userByID, read`: check the sign-in *before* touching the
  database, so an anonymous visitor cannot even find out which ids exist.
- **`NODE_ENV`** (`config.env`): `secure` cookies are turned on only in `production`.

| Method | Path | Who |
|---|---|---|
| GET | `/api/users` | anyone |
| POST | `/api/users` | anyone (sign up) |
| GET | `/api/users/:userId` | **signed in** |
| PATCH | `/api/users/:userId` | **signed in** |
| DELETE | `/api/users/:userId` | **signed in** |
| POST | `/api/auth/sessions` | anyone (sign in) |
| DELETE | `/api/auth/sessions` | anyone (sign out) |

## Try it

1. `npm install` (for cookie-parser).
2. Request 23 (no cookie) → 401. Request 19 (sign in) → look at the `Set-Cookie` response header.
3. Request 8 → 200: REST Client sent the cookie for you.
4. Request 24 (sign out), then request 8 → 401.

## The weakness (request 25)

`requireSignin` only checks that a `userId` cookie **exists**. Request 25 skips sign-in and sends a
cookie typed by hand, and the server accepts it. With anyone's id (and `GET /api/users` lists every
id) you can act as that user. Nothing proves the cookie came from our server.

Two more stages close this:
- stage 11: being signed in is not enough to change *someone else's* account;
- stage 12: the cookie gets a **signature**, so a hand-made cookie is refused.

## Exercise

In request 25, change the cookie to `Cookie: userId=hello`. Is the answer still 200? Which function
looks at the cookie, and which one decides *which user* is read? (Hint: `requireSignin` vs `userByID`.)
