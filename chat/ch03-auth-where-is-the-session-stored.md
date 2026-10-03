# Chapter 03 — Where is the "session" stored? Sign-in, cookies, JWT and express-session

**Date:** 2026-10-03
**Project:** `Chapter03 and 04/mern-skeleton/server`
**Branches discussed:** `refactor/ch03-migration` (the finished migration) and the teaching ladder `teach/ch03-server-09` … `13`

---

## 1. Checking the first mental model

The first description of the flow was: "register → the server sends a code in a cookie → GET all users must contain the code → the server compares it". Here is how it compares with the code:

| First description | What the code does |
|---|---|
| An unregistered user gets "user non existent" | The book answers "User not found". The migrated code and the ladder answer **"Email and password don't match."** for both cases. A separate message would tell anyone which emails have an account (*account enumeration*). |
| Registering saves name, email, password | Name and email, yes. In the final code the **password is never saved**: only a salted hash is stored (scrypt, ladder stage 14). Ladder stage 09 stores it in plain text on purpose, as a first step. |
| Registering returns a code in a cookie | **No.** Sign-up only answers "Successfully signed up!". The proof of identity is created at **sign-in**: `POST /api/auth/sessions`. |
| GET all users needs the code | **No.** `GET /api/users` is public. The protected routes are `GET`, `PATCH`, `DELETE /api/users/:userId`. |
| Without the code: "not allowed" | No proof, or a wrong/expired one → **401** (who are you?). Valid proof, but someone else's account → **403** (you may not). |

## 2. Where does the server store the code? Nowhere

With a **JWT**, the server keeps **only one secret** (`JWT_SECRET` in `.env`), the same for every user. It does not store tokens.

At sign-in it builds:

```
header . payload . signature
{"alg":"HS256"} . {"_id":"66fb…","iat":…,"exp":…} . HMAC-SHA256(header + payload, JWT_SECRET)
```

It sends the token to the client and forgets it.

On a protected request, `requireSignin` (express-jwt):

1. gets the token;
2. recomputes the signature with `JWT_SECRET`;
3. compares it with the token's signature;
4. checks `exp`;
5. puts the payload in `req.auth`.

So the server does not look up a stored copy. It checks that **its own secret signed this token**, because only the server knows the secret.

Things to point out to students:

- **The payload is readable** (paste a token at https://jwt.io). It is tamper-proof, not secret, so it contains only the `_id`.
- **Signing out cannot cancel a token.** It only clears the cookie and the client's copy. A copied token works until `exp`, which is why tokens now expire (`JWT_EXPIRES_IN=1d`). The book's tokens never did.

## 3. express-session vs JWT — do both use cookies?

**express-session always uses a cookie. A JWT can, but does not have to.**

```
express-session:  cookie connect.sid = s:abc123.<sig>   → server store: abc123 → { userId, … }
JWT:              cookie t = <whole token>  or  header Authorization: Bearer <whole token>
                  → server store: nothing (only JWT_SECRET)
```

| | express-session | JWT |
|---|---|---|
| Cookie needed? | always | optional: cookie or `Authorization` header |
| The client holds | a random id (the key) | the signed data itself |
| Server storage | a session store (memory, MongoDB, Redis) with a lookup on every request | none |
| Sign out / revoke | delete the entry, effective immediately | wait for `exp`, or keep a blocklist (which brings storage back) |
| Mobile apps / other domains | awkward | easy (header) |

In one sentence: both *can* use cookies. The difference is whether the cookie holds **a key to data kept on the server** (session) or **the data itself, signed** (JWT).

Header or cookie for the JWT:

| Transport | Main risk | Protection |
|---|---|---|
| `Authorization: Bearer` + token in `sessionStorage` | **XSS**: any script on the page can read and steal it | avoid XSS (React escapes output) |
| httpOnly cookie | **CSRF**: the browser sends cookies automatically | `sameSite: 'strict'` (already set) |

> The two branches differ here:
> - `refactor/ch03-migration`: `requireSignin` reads **only the header**; the cookie `t` is set but never read (as in the book).
> - Ladder stage 13: `getToken` reads the **cookie first** and falls back to the header (for a mobile app or a test script).

## 4. Stage 09: the route is `/api/auth/sessions` — where is the session?

**Nowhere yet.** In `teach/ch03-server-09-password-plain`, `POST /api/auth/sessions`:

1. returns 400 if email or password is missing;
2. runs `User.findOne({ email })`;
3. returns 401 "Email and password don't match." if there is no user or the plain-text password differs;
4. returns 200 with `{ user: { _id, name, email } }`.

**Then it forgets.** No cookie, no token, nothing in MongoDB. The next request is anonymous again, because HTTP is *stateless*. Lesson 09 makes this visible: request 8 (read a user) still works without signing in.

The name `sessions` comes from REST: the URL names a **thing** (a noun), and the method says what to do with it. Sign in = *create* a session (`POST`); sign out = *delete* it (`DELETE`, stage 10). The session is a **concept** the API is built around. It does not have to be a document in the database: depending on the stage it lives in a cookie, in a signed cookie, or inside a token.

### Where the "session" lives, stage by stage

| Stage | Where the "who is signed in" information is | What the server keeps | Weakness |
|---|---|---|---|
| 09 password-plain | **nowhere**: checked, then forgotten | nothing | every request is anonymous |
| 10 cookie-session | browser cookie `userId=66fb…` (httpOnly, sameSite) | nothing | **anyone can type the cookie by hand** (request 25) |
| 11 authorization | same cookie + `hasAuthorization` (owner only) | nothing | still forgeable |
| 12 signed-cookie | cookie `userId=s:66fb….<HMAC>` | only `COOKIE_SECRET` | readable, never expires |
| 13 jwt-cookie | JWT in cookie `t` (or `Authorization` header), with `exp` | only `JWT_SECRET` | cannot be revoked before `exp` |

The ladder **never** keeps sessions on the server. A server-side store (express-session + `connect-mongo`) would be a possible extra stage, "the other design", to compare with stage 13.

## 5. "I understand the case when the password does not match, is too short, or is absent"

Each of these is checked in a different place:

| Case | Where it is checked | Answer |
|---|---|---|
| Absent at **sign-in** | `signin`: `if (!email \|\| !password)` | 400 "Email and password are required" |
| Does not match at **sign-in** | `signin`: `user.password !== password` (stage 09) / `user.authenticate(password)` (stage 14+) | 401 "Email and password don't match." |
| Too short at **sign-up** | the schema: `minlength: [6, …]` (stage 09) / a `pre('validate')` hook (final) | 400 "Password must be at least 6 characters." |
| Absent at **sign-up** | the schema: `required: [true, 'Password is required.']` | 400 "Password is required." |

The length rule exists only at sign-up (and update). Sign-in just compares, so a 3-character password simply "does not match".
