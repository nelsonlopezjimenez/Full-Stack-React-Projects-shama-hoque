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

## 6. "So at stage 09 the sessions route exists but does nothing?"

**It authenticates, but it does not remember.** At stage 09, `POST /api/auth/sessions`:

| Request | Answer |
|---|---|
| no email or no password | 400 "Email and password are required" |
| unknown email or wrong password | 401 "Email and password don't match." |
| correct email + password | 200 `{ user: { _id, name, email } }` |

Checking who you are is **authentication**, and that part works. What is missing is **state**: no cookie and no token, so the next request is anonymous again. The URL already names a "session" that only exists from stage 10 on (cookie → signed cookie in stage 12 → JWT in stage 13). The name comes first on purpose, so the URL never has to change.

### Side note for students: a route parameter matches any text

This came up from a typo in the question: `/api/users/session` instead of `/api/auth/sessions`. **That URL is not in the code** (no route, test or `api.http` request uses it). It is still a good classroom experiment.

You might expect a 404 for a URL that was never defined. Instead, at stage 09, `GET /api/users/session` matches **`/api/users/:userId`** with `userId = "session"`. It runs `User.findById("session")`, Mongoose cannot convert `"session"` into an ObjectId (a CastError), and the error handler answers:

```
400 {"error":"Invalid _id: session"}
```

Lesson for students: **a route parameter (`:userId`) matches any text.** That is why auth lives under its own prefix, `/api/auth/...`. Any extra word placed under `/api/users/` would be taken for a user id, unless its route is declared *before* the `:userId` route (Express tries routes in the order they are registered).

## 7. Stage 10 (`teach/ch03-server-10-cookie-session`): where is the cookie?

### In the code

| Step | File | What happens |
|---|---|---|
| 1. Created | `controllers/auth.controller.js`, `signin` | `res.cookie('userId', user._id.toString(), { httpOnly: true, sameSite: 'strict', secure: <production only>, maxAge: 1 day })` → response header `Set-Cookie: userId=66fb…; Max-Age=86400; Path=/; HttpOnly; SameSite=Strict` |
| 2. Parsed | `express.js` | `app.use(cookieParser())` turns the request header `Cookie: userId=66fb…` into `req.cookies` |
| 3. Read | `auth.controller.js`, `requireSignin` | `req.cookies.userId`: missing → 401 "Please sign in"; present → `req.auth = { _id: userId }`, `next()` |
| 4. Removed | `auth.controller.js`, `signout` (`DELETE /api/auth/sessions`) | `res.clearCookie('userId', cookieOptions)`: a `Set-Cookie` that has already expired |

`requireSignin` guards `GET`, `PATCH` and `DELETE /api/users/:userId` (`routes/user.routes.js`).

### Where it is stored: on the client, never on the server

| Client | Where the cookie lives | How to see it |
|---|---|---|
| Browser | its cookie storage for the site (here `localhost`) | DevTools → Application → Cookies. `document.cookie` does **not** show it, because it is `httpOnly`, but the browser still sends it |
| VS Code REST Client (`api.http`) | the extension remembers cookies between requests | the `Set-Cookie` header in the response to request 19; request 8 then works automatically |
| curl | nowhere, unless told | `curl -c jar.txt …` saves it, `curl -b jar.txt …` sends it back |
| **Server** | **nothing stored** | it reads whatever cookie arrives with each request |

The cookie can be sent by any client, and the server cannot tell who created it. Request 25 sends a hand-typed `Cookie: userId=…` and is accepted. That is the weakness of stage 10, fixed in stage 12 (signed cookie: the server keeps only `COOKIE_SECRET`).

> Comparison with the book and the migration branch: there the cookie is named `t` and holds a **JWT**, not a bare user id (see sections 2–3).

## 8. Is `req.auth` a built-in method?

**No.** `req.auth = { _id: userId }` (in `requireSignin`, `controllers/auth.controller.js`) **creates a new property** on the request object. `req` is an ordinary JavaScript object that Express creates once per request, and assigning to a property that does not exist yet simply adds it. The name could be anything.

Every middleware later in the same request receives **the same `req` object**, which is how they pass information along:

```
requireSignin    → sets   req.auth    = { _id }        (who is calling)
userByID         → sets   req.profile = <user doc>     (which user the URL names)
hasAuthorization → reads  both and compares them       (stage 11)
read / update    → read   req.profile
```

| Property | Created by |
|---|---|
| `req.method`, `req.url`, `req.headers` | Node's HTTP server |
| `req.params`, `req.query`, `req.path`, `req.originalUrl` | Express |
| `req.body` | `express.json()` (middleware, not built in; `undefined` in Express 5 when no parser ran) |
| `req.cookies` | `cookieParser()` (middleware) |
| `req.auth`, `req.profile` | our own middleware (`requireSignin`, `userByID`) |

**Why `auth`:** in stage 13 the hand-written `requireSignin` is replaced by **express-jwt**, which puts the decoded token in `req.auth` by default (option `requestProperty`). Using the same name from stage 10 on means `hasAuthorization` and the user routes never change when the cookie becomes a JWT.

[ADVANCED] Express's documented place for per-request data is `res.locals`. Adding properties to `req` is still the common convention (express-jwt → `req.auth`, Passport → `req.user`). Choose distinctive names to avoid clashing with a library. In TypeScript the extra property must be declared (declaration merging on `Express.Request`).

## 9. Where is `req.auth` visible?

**Only inside the request that set it, and only to the code that runs after `requireSignin` in that request.** It is a property on that request's `req` object, not a variable in a file, so it goes wherever that object goes.

**Visible:**

- middleware and handlers that come **after** `requireSignin` in the same route chain, in any file, because they receive the same `req`:

  ```js
  router.route('/api/users/:userId')
    .get(authCtrl.requireSignin, userCtrl.userByID, userCtrl.read)
    //   sets req.auth ───────▶  can read it ──▶  can read it
  ```

  `hasAuthorization` (stage 11) is the code that actually reads `req.auth._id`;
- the error handler in `express.js`, if a later step of that request fails.

**Not visible:**

| Where | Why |
|---|---|
| middleware that runs **before** it (`express.json()`, `cookieParser()`) | not set yet |
| routes **without** `requireSignin` (`GET /api/users`, `POST /api/users`, `POST /api/auth/sessions`) | never set → `undefined` |
| **another request**, even the next one from the same user | every request gets a new `req`; the cookie is what lets `requireSignin` rebuild `req.auth` each time |
| **the client** | it lives only in server memory and is never sent unless a handler puts it in a response |
| after the response | the `req` object is discarded |

**Try it (stage 10):** add `console.log('req.auth =', req.auth)` at the top of `read` in `user.controller.js`. Request 8 after signing in prints the id. After signing out you get a 401, and `read` never runs. Or set a breakpoint in `read` (VS Code: JavaScript Debug Terminal → `npm run dev`) and hover over `req.auth`.

## 10. Signing in twice with the same data: any side effect?

Nothing breaks. Sign-in only **reads** the database (`User.findOne`); no stage writes anything at login (there is no "last login" field). What differs is the answer:

| Stage | Second sign-in, same data | Side effect |
|---|---|---|
| 09 (no session) | same 200 answer | none |
| 10–11 (cookie `userId`) | same `Set-Cookie: userId=…` | the browser replaces the cookie (same name and path), so the **expiry restarts** from the second login |
| 12 (signed cookie) | identical value **and** signature: the same HMAC input always gives the same output | only the expiry restarts |
| 13+ and `refactor/ch03-migration` (JWT) | a **new, different token**, because `iat`/`exp` hold the current time (identical only within the same second) | it replaces cookie `t`, **but the old token stays valid until its own `exp`** |

**The real side effect (JWT stages): tokens pile up.** Every successful login mints another valid token, and the server keeps no list (§2), so it cannot cancel earlier ones. Signing out clears only this browser's cookie. A token in another tab's `sessionStorage` (migration branch) or pasted into `api.http`/Postman keeps working until it expires. That is also what lets one user be signed in on several devices, and it is why `expiresIn` matters.

**Where repeated logins would matter:**

- **Server-side sessions** (express-session, not in the ladder): each login creates a new store entry, and old ones stay until they expire. Best practice: `req.session.regenerate()` at login (new session id, prevents *session fixation*).
- **Cost:** from stage 14 on, each login runs scrypt (~22 ms CPU, deliberately slow). Mass logins, correct or not, load the server, and wrong ones are brute-force attempts. Both are what **rate limiting** guards against (migration checklist 6.9, `later`).
- **HTTP semantics:** POST is not idempotent by definition. In the JWT stages, signing in twice really does "create a session" twice (two tokens). It is harmless because the user's data is untouched.

## 11. curl vs REST Client: do I need to sign in to list users?

**Separate clients, separate "sessions".** Each client keeps its own cookies. REST Client remembers the cookie from request 19 (sign in); **curl remembers nothing** between commands unless told to. Signing in from one does not sign in the other, and the server cannot tell they are the same person.

**But listing users needs no sign-in.** In every ladder stage (10 → 19) and in the migration branch:

```js
router.route('/api/users')
  .get(userCtrl.list)      // public: no requireSignin
  .post(userCtrl.create)   // sign up: public
```

`curl http://localhost:3000/api/users` always works. Only the one-user routes `GET`/`PATCH`/`DELETE /api/users/:userId` need a sign-in. (The Ch05 review flagged the public list: anyone can read every name and email.)

**Signing in with curl for the protected routes:**

```bash
# stages 10–12 (cookie), and 13+ (cookie t): save the cookie with -c, send it back with -b
curl -c jar.txt -X POST http://localhost:3000/api/auth/sessions \
     -H "Content-Type: application/json" \
     -d '{"email":"ann@test.io","password":"secret1"}'
curl -b jar.txt http://localhost:3000/api/users/<id>      # 200
curl http://localhost:3000/api/users/<id>                 # 401: no cookie sent

# stage 13+: or send the token from the sign-in answer as a header
curl -H "Authorization: Bearer <token>" http://localhost:3000/api/users/<id>
```

Branch difference: in stage 13+ `getToken` checks the cookie first, then the header. In `refactor/ch03-migration` only the header works.

**Windows:** in PowerShell, `curl` can be an alias for `Invoke-WebRequest`, so use `curl.exe`. The single-quoted JSON works in Git Bash; in PowerShell or cmd, put the JSON in a file and use `-d @login.json`.

## 12. What is a "cookie made by hand"?

A cookie the **client invents and sends**, instead of one the server created with `Set-Cookie`.

**Why it is possible:** sending a cookie is nothing more than a request header,

```
Cookie: userId=66fb1c…e1
```

and HTTP does not record who wrote that text. Any client can produce it:

| Client | How |
|---|---|
| REST Client | type the header `Cookie: userId=…` (`api.http` requests 25 and 27; `# @no-cookie-jar` keeps the real cookie out) |
| curl | `curl -b "userId=66fb…" http://localhost:3000/api/users/66fb…` |
| browser | DevTools → Application → Cookies → edit the value. `httpOnly` only blocks **page JavaScript**, not the user |

A real id is easy to find, because `GET /api/users` is public and lists every `_id`.

**Effect, stage by stage:**

- **Stage 10.** `requireSignin` only checks that the cookie **exists** (`req.cookies.userId`) and copies it into `req.auth`. Request 25 (Ann's id, no sign-in) → **200**: the server believes it is Ann.
- **Stage 11.** `hasAuthorization` requires `req.profile._id` to equal `req.auth._id`. Ann changing Bob → 403 (request 26). But request 27 forges `Cookie: userId=<Bob's id>`, so `req.auth._id` *is* Bob, the check passes, and Bob is changed (**200**). Authorization is worthless when authentication can be faked.
- **Stage 12.** The cookie is **signed**: `userId=s:66fb…e1.<HMAC(value, COOKIE_SECRET)>`. `cookieParser(secret)` recomputes the HMAC:

  | Cookie that arrives | `req.signedCookies.userId` | Result |
  |---|---|---|
  | the real one from sign-in | `"66fb…e1"` | allowed |
  | hand-made, unsigned | absent (it stays in `req.cookies`) | **401** (requests 25, 27) |
  | real cookie with the id edited | `false` (signature mismatch) | **401** |

  Forging a valid one needs `COOKIE_SECRET`, which never leaves the server. Signed ≠ encrypted: the id is still readable, just not changeable.
- **Stage 13+ (JWT):** same principle. The payload is readable, but any change breaks the signature → 401.

**General rule:** never trust anything the client sends (cookies, headers, body, URL) unless the server can verify it, here with a signature only the server can produce.

## 13. `req.profile && req.auth && req.profile._id.equals(req.auth._id)`

The core of `hasAuthorization` (stage 11 on, and the migration branch). It answers: **is the user named in the URL the same person who is signed in?**

| Value | Set by | Type | Meaning |
|---|---|---|---|
| `req.profile._id` | `userByID` (from MongoDB) | ObjectId | the account in the URL `/api/users/:userId` |
| `req.auth._id` | `requireSignin` (from the cookie or JWT) | string | the person making the request |

Ann changing Ann → `true` → `next()`. Ann changing Bob → `false` → **403** "User is not authorized".

**`&&` as a chain of guards.** It evaluates left to right and stops at the first falsy value, returning it. With no `req.profile` or no `req.auth`, the result is `undefined` and `.equals()` is never called. Without these guards, `req.profile._id` on a missing profile would throw a TypeError (a 500). In the normal order (`requireSignin → userByID → hasAuthorization`) both are always set, so the guards are **defensive**: a future route that forgets `userByID` or reorders middleware fails safely with a 403. `authorized` can be `undefined`/`false`/`true`; `if (!authorized)` treats the first two alike.

**Why `.equals()`.** Checked with `bson` 6.10:

| Comparison | Result | Why |
|---|---|---|
| `id === '66fb…'` | false, always | different types (object vs string) |
| `id === new ObjectId('66fb…')` | false | objects are `===` only when they are the same object |
| `id == '66fb…'` | true | only because `==` converts the ObjectId to a string: implicit, fragile (the book used this) |
| `id.equals('66fb…')` | true | explicit value comparison; accepts an ObjectId or a hex string |
| `id.equals(undefined)`, `id.equals('hello')` | false | no throw |

**Modern equivalent (optional):** `const authorized = req.profile?._id.equals(req.auth?._id) ?? false`. `?.` replaces the guards, `.equals(undefined)` is `false`, and `?? false` gives a real boolean. Same behaviour; the ladder keeps the `&&` form because it is easier for beginners to read.

## 14. Where does REST Client keep the cookie?

**On disk, in a plain JSON file.** It is not in localStorage: REST Client is not a browser and has no localStorage.

```
%USERPROFILE%\.rest-client\cookie.json
```

Checked on this machine (extension `humao.rest-client` 0.25.1): the code builds the path as `<home>/.rest-client/cookie.json` and saves to it with a file-based cookie store. The setting `rest-client.rememberCookiesForSubsequentRequests` is `true` by default. The same folder holds `history.json`, `environment.json` and `responses/`.

What follows from that:

- **It survives VS Code restarts.** The cookie stays until it expires (`maxAge`) or the server clears it. Request 24 (`DELETE /api/auth/sessions`) sends an expired `Set-Cookie`, and REST Client drops the entry.
- **It is shared** by every `.http` file and project on that machine, per domain (`localhost:3000` is one cookie jar for all projects).
- **`httpOnly` does not apply.** It only hides a cookie from a web page's JavaScript. REST Client reads and sends it normally, and the value sits in the file as **plain text**.
- **The file is sensitive.** Whoever can read it can reuse a valid cookie until it expires, even a signed cookie or a JWT. A signature prevents *forging*, not *reuse of a stolen value*; expiry limits the damage.
- **Opting out:** `# @no-cookie-jar` on one request (requests 25, 27), or set `rest-client.rememberCookiesForSubsequentRequests` to `false`. Emptying `cookie.json` signs REST Client out everywhere.

| Client | Where cookies are kept |
|---|---|
| REST Client | `~/.rest-client/cookie.json` (plain JSON) |
| Browser | a database file in the browser profile (encrypted on Windows). **Not** localStorage or sessionStorage, which are separate stores for page JavaScript (the migration client keeps its JWT copy in sessionStorage) |
| curl | nowhere, unless `-c jar.txt` (save) / `-b jar.txt` (send) |
| Server | nowhere |

## 15. Reading a real signed cookie (stage 12): `s:<id>.<signature>`

The same cookie, as seen in REST Client's `cookie.json` and in a curl `jar.txt` after signing in on stage 12:

```
REST Client:  "value":"s%3A6ac0fe25a6f690631f02cc47.f2Ve8HyO%2Fkvsqjm5C9Ut0iw2bxNSKY4ugTQW2TCCwek"
curl jar:     #HttpOnly_localhost  FALSE  /  FALSE  1791165196  userId  s%3A6ac0fe25…TCCwek
```

URL-decoded (`%3A` = `:`, `%2F` = `/`):

```
s:6ac0fe25a6f690631f02cc47.f2Ve8HyO/kvsqjm5C9Ut0iw2bxNSKY4ugTQW2TCCwek
│ └──────── value ────────┘ └────────────── signature ──────────────┘
└ "signed" marker            "." separates them
```

| Part | Meaning |
|---|---|
| `s:` | marks a **signed** cookie; `cookie-parser` checks these and puts them in `req.signedCookies` |
| `6ac0fe25a6f690631f02cc47` | the value set at sign-in: the user's `_id` (24 hex characters = an ObjectId) |
| `f2Ve8HyO…TCCwek` | **HMAC-SHA256(value, `COOKIE_SECRET`)**, base64 without the trailing `=`: 43 characters = 32 bytes (the size of a SHA-256 result) |

This is the `cookie-signature` library (used by `cookie-parser`): `createHmac('sha256', secret).update(value).digest('base64').replace(/=+$/, '')`. On the way back it cuts at the last `.`, recomputes, and compares. Match → `req.signedCookies.userId = '6ac0…'`; no match → `false` → 401.

**Why curl and REST Client hold the identical value:** an HMAC is deterministic. Same id + same secret = same signature. Only the expiry differs: curl `1791165196` = 2026-10-05 01:53:16, REST Client 01:58:15, because each sign-in restarts `maxAge` (§10). In the curl jar, `#HttpOnly_` marks an httpOnly cookie, and the two `FALSE` columns mean "not for subdomains" and "not secure-only".

**Check it yourself** (in `server/`, reads `COOKIE_SECRET` from `.env`):

```bash
node --env-file=.env -e "const c=require('crypto'); console.log(c.createHmac('sha256', process.env.COOKIE_SECRET).update('6ac0fe25a6f690631f02cc47').digest('base64').replace(/=+$/,''))"
```

It prints the same signature. Change one character of the id and the result is completely different, which is why an edited cookie is rejected.

**What this shows about stage 12:** the signed text contains **only the id, no time**. Every sign-in gives the same cookie, and expiry exists only in the client's cookie jar. The server cannot tell an old cookie from a new one, so a copied value keeps working (until `COOKIE_SECRET` changes). Stage 13's JWT puts `iat`/`exp` **inside the signed part**: every sign-in gives a different token, and the server itself rejects expired ones.

## 16. `iat` and `exp` in a JWT

Two standard fields ("registered claims", RFC 7519) in the payload. They give the token a **lifetime that the server checks itself**, which the stage 12 signed cookie did not have (§15).

A real token from `jsonwebtoken` 9 with stage 13's options (`expiresIn: '1d'`):

```js
{ _id: '6ac0fe25a6f690631f02cc47', iat: 1791079733, exp: 1791166133 }
```

| Claim | Name | Value | Date (UTC) |
|---|---|---|---|
| `iat` | issued at | 1791079733 | 2026-10-04 02:08:53 |
| `exp` | expiration time | 1791166133 | 2026-10-05 02:08:53 (`exp - iat` = 86400 s = 1 day) |

**Units: seconds since 1970-01-01 UTC**, not milliseconds:

```
Date.now()                    → 1791079733475  (ms)
Math.floor(Date.now() / 1000) → 1791079733     (s, JWT format)
new Date(payload.exp * 1000)  → back to a JS Date
```

Watch for this in the code: the cookie's `maxAge` is in **ms** (`JWT_COOKIE_MAX_AGE_MS=86400000`) while `JWT_EXPIRES_IN=1d` ends up as seconds in `exp` (keep them equal). The migration client's `isExpired()` compares `payload.exp * 1000 < Date.now()`.

**Who sets them:** `jwt.sign(payload, secret, { expiresIn: '1d' })` adds `iat` (now) automatically and sets `exp = iat + 1d`. That is why each sign-in gives a different token (§10).

**Who checks them:** `requireSignin` (express-jwt → `jsonwebtoken.verify`), against the server clock. Tested:

| Situation | Result |
|---|---|
| expired a minute ago | `TokenExpiredError: jwt expired` (+ `expiredAt`) → 401 |
| `exp` edited to a year later | `JsonWebTokenError: invalid signature` → 401: `exp` is inside the signed part |
| small clock difference between servers | `clockTolerance: <s>` option (120 s accepted a token 60 s past `exp`) |
| "no token older than 1 h", whatever its `exp` | `maxAge: '1h'` option of `verify` (uses `iat`) |

**Compared with stage 12:** there the expiry lived only in the client's cookie jar. Now the server rejects an expired token itself, even a copied one. The cookie's `maxAge` matches `exp`, so the browser drops the cookie when the server would start refusing the token anyway.

**Limits:** `exp` cannot be extended (changing it breaks the signature), so staying signed in means a new token; real apps add a long-lived *refresh token*. A token also cannot be revoked before `exp` (§10) without a `jti` (token id) plus a server-side blocklist.

Other registered claims: `nbf` (not before), `sub` (subject, often used instead of `_id`), `iss` (issuer), `aud` (audience), `jti` (token id).

## 17. The cookie carries `_id`: the only option? Who decides?

**The developer decides, in the sign-in code.** Clients (browser, curl, REST Client) store and resend whatever text the server sends; HTTP does not care what is inside.

| Stage | The deciding line | Cookie name / content |
|---|---|---|
| 10–11 | `res.cookie('userId', user._id.toString(), …)` | `userId` = the id |
| 12 | same with `signed: true` | `userId` = `s:<id>.<signature>` |
| 13+ | `jwt.sign({ _id: user._id }, secret, …)` → `res.cookie('t', token, …)` | `t` = JWT with payload `{ _id, iat, exp }` |

The **name** and the **content** are both choices made in `signin`. Libraries only add their own defaults where they are involved: `jwt.sign` adds `iat`/`exp`; express-session would name its cookie `connect.sid` and put a random id in it.

**Options:**

| Content | Pros | Cons |
|---|---|---|
| signed user id (stages 10–12) | tiny, simple | readable; no time inside, so the server cannot expire a copy (§15) |
| JWT with claims (13+) | no lookup to know who is calling; expiry inside | readable; not revocable before `exp`; extra claims can go stale |
| random session id (express-session) | reveals nothing; revocable at once | session store + a lookup per request |
| encrypted data (JWE, `iron-session`) | contents hidden | more complex; still not revocable before expiry |

**Rules for choosing what goes inside:**

1. **No secrets** (password, hash, private data). Signed ≠ encrypted.
2. **A stable identifier:** `_id` never changes; an email can (users can edit it), so it is a poor identity key.
3. **Minimal:** a browser cookie holds about **4 KB** at most and travels with every request.
4. **Beware of changing data:** `role: 'admin'` in a JWT stays "admin" until `exp`, even after a demotion. Use short lifetimes or re-check the database.
5. **Unsigned values must be unguessable:** an ObjectId is predictable (it starts with a timestamp), and `GET /api/users` lists them all anyway, hence the stage 10 forgery (§12). A random session id has ~128 bits of randomness.

**Why `_id` here:** the code needs exactly that value. `requireSignin` → `req.auth._id`, and `hasAuthorization` compares it with `req.profile._id` (loaded by `userByID` from the URL id). Convention alternative: name it `sub` in the JWT (`{ sub: '66fb…' }`) and read `req.auth.sub`. That is purely a naming choice; the ladder keeps `_id` to match MongoDB.

## 18. Is a unique id unavoidable? Realistic alternatives

**Some identifier on every request is unavoidable; the database `_id` itself is not.** HTTP is stateless (§4), so each request must carry either **the credentials again** or **a stand-in** the server issued earlier that leads back to a user. Every realistic design is one of these two; the choice is what the stand-in contains.

| Option | Travels with each request | Server finds the user by | Seen in |
|---|---|---|---|
| DB id, signed (the ladder) | `_id` in a signed cookie or a JWT (`sub`) | reading it | most JWT APIs |
| random session id | opaque random string (`connect.sid`) | session store lookup → user id | express-session, Django, Rails, PHP |
| random token, stored hashed | opaque random string | hash it, look the hash up in the DB | API keys, GitHub personal access tokens, "remember me" |
| public id instead of `_id` | a UUID/random handle in the JWT | a lookup by that field | apps that hide internal ids |
| encrypted cookie | the id, encrypted | decrypting it | `iron-session`, framework session cookies |
| external identity (OpenID Connect) | afterwards, usually your own session or JWT | the provider's `sub` mapped to a local user | "Sign in with Google/Microsoft/GitHub" |
| credentials every time (HTTP Basic) | `Authorization: Basic base64(email:password)` | checking the password on every request | old internal tools; avoided: the password travels constantly, a slow hash on every request, no real sign-out |

Passkeys/WebAuthn and client certificates change **how you prove who you are at sign-in**; afterwards the app still issues a session id or a token.

**For this app:**

- **signed id / JWT** (the ladder): fine and very common, especially for APIs used by mobile apps or other servers. The id is readable, but `GET /api/users` exposes every id anyway;
- **random session id**: the other mainstream choice, better when you need instant sign-out or "sign out all devices". The cookie carries no user information;
- **public UUID**: when ids should reveal nothing (an ObjectId starts with its creation time).

The rest work but are niche (encrypted cookies, client certificates) or outdated (Basic Auth).

## 19. Signed cookie vs JWT: is `iat`/`exp` the only difference?

**Mostly yes, for stage 12 vs stage 13.** Both are HMAC-SHA256 over a payload with a server-only secret. Server-checked expiry is the biggest difference, but not the only one.

Wording: a **cookie** is a way to carry data; a **JWT** is a data format. In stage 13 the JWT travels *inside* a cookie (`t`). The real comparison is *signed cookie value* vs *JWT*.

**The same:**

| | Stage 12 signed cookie | Stage 13 JWT |
|---|---|---|
| protection | HMAC-SHA256(data, secret) | HMAC-SHA256(header.payload, secret) |
| readable | yes | yes |
| server storage | none (`COOKIE_SECRET` only) | none (`JWT_SECRET` only) |
| early revocation | no | no |
| cookie flags | same (`httpOnly`, `sameSite`, `secure`) | same |
| what routes see | `req.auth = { _id }` | `req.auth = { _id, iat, exp }`, `hasAuthorization` unchanged |

**Different:**

| | Signed cookie | JWT |
|---|---|---|
| expiry enforced by the server | no (client cookie jar only, §15) | **yes** (`exp` is signed, §16) |
| format | Express convention `s:<value>.<sig>`, one value | open standard (RFC 7519), JSON with any claims |
| who can verify | Express's `cookie-signature` (Node apps in practice) | libraries in every language |
| transport | a cookie | cookie **or** `Authorization: Bearer` (stage 13 `getToken` accepts both) |
| algorithms | shared-secret HMAC only | HMAC or public-key (RS256/ES256): other services verify with a public key and cannot issue tokens |
| pitfalls | few | must pin `algorithms: ['HS256']` (`alg: none` attacks) |
| size | ~70 characters | ~150+ characters |
| code | `cookieParser(secret)`, `req.signedCookies`, a hand-written 401 | `jsonwebtoken` + `express-jwt` (`UnauthorizedError` → 401) |

**In one sentence:** for one Express server and a browser they behave almost the same, and server-checked expiry is the practical gain. JWT pays off when **other clients or services** must use or verify the token (a mobile app, a second backend, another language). That is why lesson 13 can swap them with almost no change to the routes.

## 20. Unsigned vs signed cookie

The difference is **who can produce a valid value**: anyone (unsigned) or only the server, which alone knows the secret (signed). Forging is covered in §12 and the signature's structure in §15.

**The code change from stage 11 to stage 12 is four lines:**

```diff
 // config/config.js
+  cookieSecret: process.env.COOKIE_SECRET ?? 'dev-only-secret-do-not-use-in-production',
 // express.js
-app.use(cookieParser())
+app.use(cookieParser(config.cookieSecret))
 // auth.controller.js, signin
-  res.cookie('userId', user._id.toString(), { ...cookieOptions, maxAge: ONE_DAY_MS })
+  res.cookie('userId', user._id.toString(), { ...cookieOptions, maxAge: ONE_DAY_MS, signed: true })
 // auth.controller.js, requireSignin
-  const userId = req.cookies.userId
+  const userId = req.signedCookies.userId
```

| | Unsigned (stages 10–11) | Signed (stage 12) |
|---|---|---|
| value | `userId=66fb…e1` | `userId=s:66fb…e1.<HMAC>` |
| read from | `req.cookies.userId` | `req.signedCookies.userId` |
| client reads it | yes | yes (signed ≠ encrypted) |
| client edits it | accepted | signature mismatch → `false` → 401 |
| client invents one | accepted (requests 25/27 → 200) | needs `COOKIE_SECRET` → 401 |
| stolen copy reused | works | **still works**: a signature proves origin, not who sends it |
| expiry checked by the server | no | no (only the JWT's `exp`, §16) |
| server keeps | nothing | only the secret |

**How `cookie-parser(secret)` sorts incoming cookies:** no `s:` prefix → `req.cookies`; `s:` + valid signature → `req.signedCookies` (the value); `s:` + invalid signature → `req.signedCookies` = `false`.

**What signing does not do:** hide the value (use encryption); stop theft or reuse (`httpOnly`, HTTPS/`secure`, short lifetimes); expire on the server (needs a time inside the signed data, i.e. a JWT `exp`); survive a leaked secret. Whoever has `COOKIE_SECRET` can sign anything, so rotate it if it leaks: all cookies become invalid, which is also the emergency "sign out everyone".

**When unsigned is fine:** values where a fake does no harm (theme, language, a dismissed banner, cookie consent). If the server **makes a decision** from the value (identity, permissions, prices, role), it must be signed, encrypted, or a random id pointing to data on the server.

## 21. curl: sign in and get the token

Applies to **stage 13+** and `refactor/ch03-migration`: `POST /api/auth/sessions` answers `{ token, user: { _id, name, email } }` and sets the cookie `t`. Stages 10–12 return no token (the cookie is everything).

**Git Bash:**

```bash
curl -X POST http://localhost:3000/api/auth/sessions \
     -H "Content-Type: application/json" \
     -d '{"email":"ann@test.io","password":"secret1"}'
```

| Option | Meaning |
|---|---|
| `-X POST` | method (`-d` already implies POST; explicit is clearer) |
| `-H "Content-Type: application/json"` | without it `express.json()` does not parse the body → 400 "Email and password are required" |
| `-d '…'` | request body |
| `-i` | show response headers (`Set-Cookie: t=…; HttpOnly; SameSite=Strict`) |
| `-c jar.txt` | save the cookie (reuse with `-b jar.txt`) |
| `-s` | silent (no progress meter), useful when capturing output |

**Keep the token in a variable** (`sed` is built into Git Bash):

```bash
TOKEN=$(curl -s -X POST http://localhost:3000/api/auth/sessions \
  -H "Content-Type: application/json" \
  -d '{"email":"ann@test.io","password":"secret1"}' \
  | sed -n 's/.*"token":"\([^"]*\)".*/\1/p')
echo "$TOKEN"
curl -H "Authorization: Bearer $TOKEN" http://localhost:3000/api/users/<id>
```

Alternatives: `| jq -r .token` (if jq is installed), or `| node.exe -e "process.stdin.on('data', d => console.log(JSON.parse(d).token))"`. Write `node.exe`, not `node` (see below).

**How the capture works:**

```
TOKEN=$(  curl …  |  sed/node (picks the token)  )
          └─┬──┘     └──────────┬─────────────┘
            │ stdout = whole JSON  │ stdout = just the token
            └──────► stdin of next └──────► captured into TOKEN
```

The pipe `|` sends curl's output (the whole JSON) to the **stdin** of the next command, not into the variable. `$( … )` (command substitution) captures the **stdout of the last command**, i.e. only the token, and strips the trailing newline. **stderr is not captured**: error messages (such as `stdin is not a tty`) still appear on screen, and the variable stays empty. Check with `echo "[$TOKEN]"` (`[]` = empty).

**Troubleshooting (Git Bash):**

- **`stdin is not a tty`:** in Git for Windows' terminal (mintty), `node` is often an alias for `winpty node.exe`, and winpty refuses piped input. Check with `type node`. Fix: call `node.exe` directly, or use `sed`.
- **Line continuation:** `\` must be the **last character** of the line it continues (no space after it). A `\` alone on the next line, or a missing one, ends the command early, and `| …` becomes a separate, broken command. When in doubt, write the command on one line.
- **`echo "$TOKEN"` is empty:** run the curl part alone and look at the raw answer (400/401, or no `token` field on stages 10–12).

**PowerShell:** use `curl.exe` (plain `curl` may be `Invoke-WebRequest`) with the JSON in a file, or let PowerShell parse the answer:

```powershell
'{"email":"ann@test.io","password":"secret1"}' | Out-File -Encoding ascii login.json
curl.exe -s -X POST http://localhost:3000/api/auth/sessions -H "Content-Type: application/json" -d "@login.json"

$r = Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/auth/sessions `
     -ContentType 'application/json' -Body '{"email":"ann@test.io","password":"secret1"}'
$r.token
Invoke-RestMethod -Uri http://localhost:3000/api/users/$($r.user._id) -Headers @{ Authorization = "Bearer $($r.token)" }
```

| Answer | Cause |
|---|---|
| 200 + `token` | correct |
| 400 "Email and password are required" | missing field **or** missing `Content-Type` header |
| 401 "Email and password don't match." | unknown email or wrong password |
| 200 without `token` | stage 10–12 (cookie only) |

## 22. Does `iat` change every second?

**Not inside a token.** `iat` is written once, when the token is signed, and frozen by the signature. What changes every second is the clock, so a **new** token signed a second later gets a different `iat`.

Tested with `jsonwebtoken` 9:

| Situation | `iat` | Token |
|---|---|---|
| two sign-ins in the same second | same (1791084308) | **identical**, character for character |
| a sign-in 1.1 s later | 1791084309 | different |
| the first token, decoded again later | still 1791084308 | unchanged |

- **An existing token is frozen.** `iat`/`exp` are part of the signed text (changing them breaks the signature, §16). Nothing "updates" a token; it only gets older compared to the clock, until `exp` is passed.
- **Resolution is whole seconds:** `iat = Math.floor(Date.now() / 1000)`. Same payload + same `iat`/`exp` + same secret = the same HMAC, so the same token (hence "different tokens, except within the same second" in §10).
- **The server never rewrites `iat`.** A fresh `iat` (and a later `exp`) means signing in again, or a refresh token in apps that have one.

## 23. Offline alternatives to jwt.io

Offline is also **safer**: pasting a real, still-valid token into a website hands it to a third party. All three commands below were tested on a stage-13-style token.

**1. Decode with Node (nothing to install, decode only, like jwt.io's default view):**

```bash
node -e "
const [h, p] = process.argv[1].split('.')
const dec = (s) => JSON.parse(Buffer.from(s, 'base64url'))
const payload = dec(p)
console.log('header :', dec(h))
console.log('payload:', payload)
for (const k of ['iat', 'exp', 'nbf']) if (payload[k]) console.log(k.padEnd(7), new Date(payload[k] * 1000).toISOString())
" "$TOKEN"
```

Prints the header, the payload, and `iat`/`exp` as dates.

**2. Verify the signature** (in the ladder's `server/`, stage 13+, where `jsonwebtoken` is installed and `.env` holds `JWT_SECRET`):

```bash
node --env-file=.env -e "
const jwt = require('jsonwebtoken')
try { console.log('valid ->', jwt.verify(process.argv[1], process.env.JWT_SECRET, { algorithms: ['HS256'] })) }
catch (e) { console.log('INVALID ->', e.name + ':', e.message) }
" "$TOKEN"
```

Right secret → `valid -> { _id, iat, exp }`; wrong secret → `JsonWebTokenError: invalid signature`; expired → `TokenExpiredError: jwt expired`. Doing this online would mean giving your secret to a website: never do that.

**3. Git Bash only (no Node):** base64url → base64 (swap `_-` → `/+`, add `=` padding):

```bash
P=$(echo "$TOKEN" | cut -d. -f2 | tr '_-' '/+'); while [ $(( ${#P} % 4 )) -ne 0 ]; do P="$P="; done; echo "$P" | base64 -d
```

**Others (not tried here):** the browser DevTools console, `JSON.parse(atob(token.split('.')[1].replace(/-/g,'+').replace(/_/g,'/')))`; VS Code marketplace "JWT" decoder extensions; smallstep's `step crypto jwt inspect --insecure` (needs to be installed).

## 24. How secure is two-factor authentication (a code app)?

**It depends on who has the secret, not on the phone.**

**How a code app (TOTP, RFC 6238) works:**

1. At setup the site creates a random **secret** and shows it as a QR code. The app stores it, and **the site keeps a copy**.
2. Every 30 s both sides compute `HMAC-SHA1(secret, floor(time / 30))` and shorten it to 6 digits ("dynamic truncation").
3. At sign-in you type the code; the server computes its own and compares.

The algorithm is public. Ten lines of Node (`crypto.createHmac`) reproduce the RFC's test codes exactly (`94287082` at t=59, `07081804` at t=1111111109, secret `12345678901234567890`), and with the same secret a "phone" and a "laptop" produce the same code. **Whoever has the secret can generate valid codes on any device.**

- "Only my phone has it" holds only if the secret really exists only there. Cloud backup or sync in authenticator apps (Google Authenticator sync, Authy, password managers) and screenshots of the QR code copy it elsewhere.
- On another computer, security depends on who can use that computer.

**How attacks get around 2FA in practice:**

| Attack | How | Stopped by a code app? |
|---|---|---|
| real-time phishing (most common) | a fake login page takes password + current code and forwards both within the 30 s | **no** |
| stolen session cookie / token | after sign-in, malware or XSS copies the cookie or JWT, so the attacker is "already signed in" | **no**: 2FA is checked only at sign-in (§10, §14, §17) |
| SIM swap | the carrier moves your number to the attacker's SIM | affects **SMS** codes only |
| push "approve?" fatigue | repeated prompts until one is approved by mistake | reduced by number matching |
| recovery codes | backup codes found | no: store them like a password |
| server breach | TOTP is a **shared** secret: a hacked site loses everyone's secrets | no |

**Ranking of second factors:**

| Factor | Strength | Why |
|---|---|---|
| SMS code | weakest | SIM swap, interception; still far better than nothing |
| code app (TOTP) | good | stops password leaks and mass guessing; not phishing-proof |
| push with number matching | good | same phishing weakness, less typing |
| **passkey / security key** (FIDO2/WebAuthn) | **strongest** | public-key: the private key **never leaves the device** (secure chip), the server stores only a public key, and the browser ties it to the **real domain**, so a fake site gets nothing usable |

**Link to Git:** GitHub's 2FA protects **web sign-in** only. `git push` over SSH or HTTPS uses an already-proven credential (SSH key, stored token), much like a session cookie, and asks for no second factor. A copied key file without a passphrase bypasses 2FA (see `git-config-and-push.md` §4).

**Summary:** a code app is a big step up from a password alone and stops most automated attacks. It is not near 100%, because the common attacks go *around* it (phishing, session theft), not *through* it. Passkeys or security keys close the phishing gap.
