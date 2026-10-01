# Stage 12 — A cookie nobody can fake: signatures

**Branch:** `teach/ch03-server-12-signed-cookie`

## Goal

The server refuses sign-in cookies it did not create itself.

## New ideas

- **Signature.** The server computes a short code from the cookie's value plus a **secret** (an
  *HMAC*) and stores both: `userId=s:66fb…e1.Xb3k…`. When the cookie comes back, it computes
  the code again. A different value or a missing code means it is not ours.
- **Signed is not encrypted.** Anyone can still *read* the id in the cookie. They just cannot
  *change* it. Never put secrets in a signed cookie.
- **The secret** is in `.env` (`COOKIE_SECRET`), never in git. Whoever has it can sign any cookie.
  If it leaks, change it: every existing cookie becomes invalid, so everyone has to sign in again.
- **`cookieParser(secret)`** checks signatures. Valid signed cookies appear in `req.signedCookies`,
  a tampered one is `false`, and unsigned ones stay in `req.cookies`.

## What changed

| File | What |
|---|---|
| `config/config.js`, `.env.example` | `COOKIE_SECRET` |
| `express.js` | `cookieParser(config.cookieSecret)` |
| `controllers/auth.controller.js` | `signed: true` when setting, `req.signedCookies` when reading |
| `api.http` | 25 and 27 now expect 401 |

## Try it

1. Add `COOKIE_SECRET=...` to your `.env` (see `.env.example` for a command that makes one).
2. Sign in (request 19) and look at the `Set-Cookie` header: the value starts with `s%3A` (`s:`, URL-encoded).
3. Requests 25 and 27: **401**. The hand-made cookies from stages 10 and 11 no longer work.
4. Copy the real cookie value, change one character of the id, and send it by hand → 401.
5. Change `COOKIE_SECRET` and restart: your own cookie stops working too, so sign in again.

## What is still missing

The cookie works, but:
- its expiry is only the browser's `Max-Age`. The value has no expiry date of its own, so a copied
  cookie would be valid until the secret changes;
- it is our own format. Other clients (a mobile app, another server) expect a standard token they can
  send in an `Authorization` header.

A **JSON Web Token** (stage 13) is a signed value too, in a standard format with an expiry date inside it.

## Exercise

Remove `signed: true` from `res.cookie` (keep the rest), sign in, and send request 8. What happens,
and why? Put it back afterwards.
