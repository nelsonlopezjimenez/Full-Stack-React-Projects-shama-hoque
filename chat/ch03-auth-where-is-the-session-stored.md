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
