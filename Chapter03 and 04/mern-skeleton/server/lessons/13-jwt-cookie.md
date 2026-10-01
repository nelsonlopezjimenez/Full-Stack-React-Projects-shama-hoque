# Stage 13 — JSON Web Tokens

**Branch:** `teach/ch03-server-13-jwt-cookie`

## Goal

Replace our home-made signed cookie with the standard: a **JWT** that has an expiry date inside it.
It travels in the same httpOnly cookie, or in an `Authorization` header for clients without cookies.

## New ideas

- **A JWT** is three parts separated by dots, `header.payload.signature`, each one Base64URL text:
  - header: `{ "alg": "HS256", "typ": "JWT" }`
  - payload: `{ "_id": "66fb…", "iat": 1727790000, "exp": 1727876400 }`, meaning who, issued at, expires at
  - signature: HMAC-SHA256 of the first two parts with `JWT_SECRET`, the same idea as stage 12.
- **`jsonwebtoken`** creates tokens: `jwt.sign(payload, secret, { algorithm, expiresIn })`.
- **`express-jwt`** checks them in `requireSignin`: it verifies the signature and the expiry and puts
  the payload in `req.auth`. If either check fails, it raises an `UnauthorizedError`, which the error
  handler turns into a **401**.
- **Where the token travels.** `getToken` reads the httpOnly cookie `t` first and falls back to
  `Authorization: Bearer <token>`. Browsers use the cookie; a mobile app or a test script uses the header.
  That is why sign-in also returns the token in the body.
- **`algorithms: ['HS256']`** is required: the server accepts exactly one algorithm, so an attacker
  cannot pick a weaker one (or `none`).
- **Expiry.** `JWT_EXPIRES_IN=1d`. After that the token is refused, even if someone copied it.
  `JWT_COOKIE_MAX_AGE_MS` makes the browser drop the cookie at the same time.

## What changed

| File | What |
|---|---|
| `package.json` | `jsonwebtoken`, `express-jwt` |
| `config/config.js`, `.env.example` | `JWT_SECRET`, `JWT_EXPIRES_IN`, `JWT_COOKIE_MAX_AGE_MS` (instead of `COOKIE_SECRET`) |
| `controllers/auth.controller.js` | `jwt.sign`, cookie `t`, `getToken`, `requireSignin` from `express-jwt` |
| `express.js` | `cookieParser()` without a secret; `UnauthorizedError` → 401 in the error handler |
| `api.http` | 19 stores the token, 23/25/27 show the new 401 messages, 28 uses the header |

`hasAuthorization` and every user route are unchanged: they only use `req.auth._id`, and it does not
matter whether it came from a cookie or a token. That is the benefit of small functions with one job.

## Try it

1. `npm install`, and rename `COOKIE_SECRET` to `JWT_SECRET` in your `.env`.
2. Request 19, then copy the `token` from the answer and paste it at https://jwt.io. You can read the
   payload: **a JWT is signed, not encrypted**. Never put a password or other secrets in it.
3. Requests 8 and 14 work with the cookie. Request 28 works with the header and no cookie.
4. Requests 23, 25, 27 → 401, each with its own message (no token, malformed token).
5. Set `JWT_EXPIRES_IN=10s` in `.env`, restart, sign in, wait 10 seconds, send request 8 →
   401 "jwt expired". (Set it back to `1d`.)

## Exercise

At jwt.io, change the `_id` in the payload of your token and send the edited token in request 28.
Which check refuses it, and what is the message?
