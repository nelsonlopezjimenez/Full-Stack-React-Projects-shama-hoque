# Architecture & Refactoring Decisions

## Project: mern-social (Chapter 05)
**Branch:** main (single package, original RPC routes)
**Last updated:** 2026-05-23

> **Note on branch context:**
> This file was ported from `refactor/separate-client-server` which contains:
> - REST route refactor (Section 3) — **not present on this branch**
> - Client/server folder separation (Section 5) — **not present on this branch**
> - Vitest test infrastructure across two packages — **adapted for single package below**
>
> On `main`, routes remain the original RPC style (`POST /auth/signin`,
> `PUT /api/users/follow`, IDs in `req.body`, etc.). The error handling fixes
> in Section 7 are implemented here using those original routes. When this
> branch is eventually reconciled with `refactor/separate-client-server`, the
> error handling will be adapted to the REST route structure at that time.

---

## 1. Upgrade Stack (completed)

Migrated from the original book stack to:

| Layer | Before | After |
|---|---|---|
| Node | <14 | >=20 (tested on 24.x) |
| React | 17 | 19 |
| MUI | v4 | v6 |
| React Router | v5 | v7 |
| Mongoose | 6 | 8 |
| Build tool | Webpack (CRA) | Vite 6 |

---

## 2. Bug Fixes Applied

### MUI Grid2 prop migration
`xs` and `sm` props were removed in MUI v6 Grid2. Replaced with the unified `size` prop.
```jsx
// Before
<Grid xs={8} sm={7}>
// After
<Grid size={{ xs: 8, sm: 7 }}>
```
File: `client/core/Home.jsx`

### NewPost undefined user on first render
`state.user` initialized as `{}` caused `/api/users/photo/undefined` on the first render
before `componentDidMount` ran.
```js
// Before
state = { user: {} }
// After
state = { user: auth.isAuthenticated() ? auth.isAuthenticated().user : {} }
```
File: `client/post/NewPost.jsx`

### listNewsFeed mixed-type $in query
`req.profile.following` is a populated array of `{ _id, name }` objects. Pushing
`req.profile._id` (a raw ObjectId) into it created a mixed-type array that caused
CastErrors in the `$in` query.
```js
// Before
const following = req.profile.following
following.push(req.profile._id)
Post.find({ postedBy: { $in: req.profile.following } })
// After
const following = req.profile.following.map(f => f._id)
following.push(req.profile._id)
Post.find({ postedBy: { $in: following } })
```
File: `server/controllers/post.controller.js`

---

## 3. REST Route Refactoring

### Why this was done
The original book used an RPC-style (Remote Procedure Call) pattern with verb-based
URLs and IDs in the request body. We refactored to noun-based REST before the
folder separation refactor, because it is cheaper to fix routes before a mobile
client or third-party integration depends on them.

### Full route mapping

#### Auth
| Before | After | Notes |
|---|---|---|
| `POST /auth/signin` | `POST /api/auth/sessions` | moved under /api |
| `GET /auth/signout` | `DELETE /api/auth/sessions` | GET→DELETE, same resource |

#### Users
| Before | After | Notes |
|---|---|---|
| `GET /api/users/photo/:userId` | `GET /api/users/:userId/photo` | photo as sub-resource |
| `PUT /api/users/follow` | `PUT /api/users/:userId/following/:targetId` | IDs in URL, no body |
| `PUT /api/users/unfollow` | `DELETE /api/users/:userId/following/:targetId` | DELETE expresses removal |
| `GET /api/users/findpeople/:userId` | `GET /api/users/:userId/suggestions` | noun, not verb phrase |

#### Posts
| Before | After | Notes |
|---|---|---|
| `POST /api/posts/new/:userId` | `POST /api/users/:userId/posts` | userId owns the post |
| `GET /api/posts/by/:userId` | `GET /api/users/:userId/posts` | same resource, GET |
| `GET /api/posts/feed/:userId` | `GET /api/users/:userId/feed` | feed as sub-resource |
| `GET /api/posts/photo/:postId` | `GET /api/posts/:postId/photo` | sub-resource ordering |
| `PUT /api/posts/like` | `POST /api/posts/:postId/likes` | likes as collection |
| `PUT /api/posts/unlike` | `DELETE /api/posts/:postId/likes` | DELETE from collection |
| `PUT /api/posts/comment` | `POST /api/posts/:postId/comments` | comments as collection |
| `PUT /api/posts/uncomment` | `DELETE /api/posts/:postId/comments/:commentId` | target by ID |

### Controller changes driven by route change

**follow/unfollow** — IDs moved from `req.body` to `req.params`:
```js
// Before: req.body.userId, req.body.followId
// After:  req.params.userId, req.params.targetId
```

**like/unlike** — postId and userId no longer come from body; postByID param
middleware already loads `req.post`, JWT provides `req.auth`:
```js
// Before: req.body.postId, req.body.userId
// After:  req.post._id,    req.auth._id
```

**comment** — same pattern; postedBy set from JWT not body:
```js
// Before: commentData.postedBy = req.body.userId
// After:  commentData.postedBy = req.auth._id
```

**uncomment** — commentId moved from body object to URL param:
```js
// Before: req.body.comment._id
// After:  req.params.commentId
```

### Client-side signature cleanup
`like`, `unlike`, `comment`, and `uncomment` in `api-post.jsx` no longer need a
`params` argument since userId is derived from the JWT on the server. Callers in
`Post.jsx` and `Comments.jsx` updated accordingly.

### Vite proxy cleanup
`/auth` proxy entry removed from `vite.config.js` since all auth routes now live
under `/api`, which was already proxied.

---

## 4. REST in Production — Pragmatic Notes

### The author's RPC choice was not wrong
Shama Hoque used RPC-style routing intentionally for a learning context. RPC is a
legitimate pattern (gRPC, GraphQL mutations, and JSON-RPC are all production-grade
RPC approaches). The choice to teach with verb URLs and body-based IDs is a common
pedagogical shortcut that gets the concept across without REST overhead.

### Richardson Maturity Model
Most production APIs sit at Level 1-2, not the theoretical Level 3:
- **Level 0** — single endpoint, everything in body (SOAP, XML-RPC)
- **Level 1** — separate URLs per resource, verb-heavy (book's approach)
- **Level 2** — nouns + HTTP verbs correctly used (our refactor)
- **Level 3** — hypermedia/HATEOAS (almost nobody ships this)

### Real production problems caused by non-standard REST

| Problem | Root cause |
|---|---|
| CDN caches a state-changing GET | GET used for follow/like instead of PUT/POST |
| AWS API Gateway / Kong misconfiguration | PUT/DELETE routes need explicit config teams miss |
| Auto-generated SDK produces wrong code | Swagger/OpenAPI codegen depends on method+URL alignment |
| APM dashboards (Datadog, New Relic) can't distinguish traffic | Single verb URL masks multiple operations |
| Security scanner flags insecure direct object reference | PUT without resource ID in URL looks like IDOR |

### When teams fix it vs. leave it

**Teams fix non-standard routes when:**
- Building a public API consumed by external developers
- Adding auto-generated client SDKs (mobile, third-party)
- A production incident is traced directly to the pattern
- Starting a v2 API versioning effort anyway

**Teams leave it when:**
- Internal API only consumed by their own frontend
- Changing routes requires versioning (`/v2/`) to avoid breaking existing clients
- Mobile apps on old routes can't be forced to update immediately
- Cost of migration exceeds the measurable benefit

### Rule of thumb
Fix it before external consumers depend on the URLs. Once a mobile app or
third-party integration is on the old routes, you're maintaining two versions.
The refactor in this project happened at the right time — before the folder
separation and before any external consumers existed.

---

## 5. Client / Server Folder Separation (completed)

Split the single-package project into two independent packages, each with its
own `package.json`, `node_modules`, and scripts. Motivated by: cleaner dependency
graphs, separate deploy targets, and the ability to run `npm install` in only the
layer that changed.

```
mern-social/
├── package.json          ← root orchestration only (no node_modules of its own)
├── client/
│   ├── package.json      ← React/Vite/MUI/testing-library deps
│   ├── index.html
│   ├── vite.config.js
│   └── src/              ← all React source (moved from client/ root)
└── server/
    ├── package.json      ← Express/Mongoose deps
    ├── nodemon.json
    └── config/
```

Root scripts delegate via `--prefix`:
```
npm run dev:server   → nodemon in server/
npm run dev:client   → vite in client/
npm run test:server  → vitest in server/
npm run test:client  → vitest in client/
npm start            → node server.js in server/
```

**Decision deferred:** npm workspaces — adds hoisting and cross-package linking
but introduces risk at this stage. Postponed until the separation is proven stable.

---

## 6. Automated Testing (completed)

Vitest added to both packages. Tests follow a deliberate 4-level progression
designed for teaching — each level introduces exactly one new concept:

| Level | File | New concept |
|---|---|---|
| 1 | `server/tests/unit/dbErrorHandler.test.js` | `describe/it/expect`, pure function |
| 2 | `server/tests/unit/config.test.js` | `vi.resetModules()` + dynamic import for env vars |
| 3 | `client/src/__tests__/auth-helper.test.js` | `vi.mock`, jsdom, `sessionStorage` |
| 4 | `client/src/__tests__/Menu.test.jsx` | `render/screen`, `MemoryRouter`, `mockReturnValue` |

All 24 tests pass on both machines (Windows, different Node versions). Tests are
deliberately MongoDB-independent — no live database needed to run them. Full
rationale documented in `TEST.md`.

**Key finding during Level 1:** `dbErrorHandler.js` uses `err.message.lastIndexOf('.$')`
to extract the field name from duplicate-key errors. This assumes the older MongoDB
message format (`.$email_1`). Newer MongoDB versions emit a different format —
the extraction silently produces a garbled string. This is one of the items flagged
for the error handling refactor (Section 7).

---

## 7. Error Handling Analysis (in progress — not yet fixed)

A full audit of unhandled and poorly handled error scenarios was completed.
No code has been changed yet. The findings are grouped below by severity.

### Refactoring order context
The agreed sequence for this project was:
1. ✅ Upgrade stack (Node 20+/24, React 19, MUI v6, React Router v7, Vite)
2. ✅ Separate client / server packages
3. ✅ REST route refactor
4. ✅ Automated tests (foundation before error handling changes)
5. ⬜ Error handling improvements ← current position

### What dbErrorHandler.js covers today
- MongoDB duplicate key errors (codes 11000/11001) — via brittle message parsing
- Mongoose validation errors — but only the last field when multiple fail

### What is NOT covered (findings)

**Crashes — unhandled TypeErrors:**

| Location | Scenario |
|---|---|
| `user.controller.js` → `remove` | `findByIdAndDelete` returns `null` if already deleted → `null.hashed_password` throws |
| `user.controller.js` → `photo` | User with no photo subdocument → `req.profile.photo.data` throws |
| `post.controller.js` → `photo` | Post with no photo → `req.post.photo.contentType` throws (no guard at all) |
| `post.controller.js` → `comment` | `req.body.comment` missing → `undefined.postedBy` throws |
| `user.controller.js` → `update` | `fs.readFileSync` is outside the try/catch — disk/permission errors uncaught |
| `post.controller.js` → `create` | Same `fs.readFileSync` issue |

**Silent empty-string responses:**

| Scenario | `dbErrorHandler` result |
|---|---|
| MongoDB unreachable mid-session (`MongoServerSelectionError`) | `''` empty string |
| Network timeout (`MongoNetworkTimeoutError`) | `''` empty string |
| Invalid ObjectId in URL param (`CastError`) | `''` empty string |

**Startup gap (`server.js`):**
- `mongoose.connect()` and `app.listen()` run concurrently — the HTTP server
  accepts requests before the DB connection is confirmed. During the connection
  timeout window, operations are buffered by Mongoose and eventually fail silently
  with empty error strings. The `.catch()` throws an unhandled promise rejection
  that exits the process after several seconds.

**Express pipeline gaps (`express.js`):**
- No 404 handler — unknown routes return Express's default HTML page (wrong for a JSON API)
- The `else { next(err) }` branch in the JWT error middleware has no final catch-all
  handler — unrecognized errors return HTML, with stack trace exposed in development

**Wrong status codes:**
- `userByID` and `postByID` return 400 for all errors including genuine not-found
  (should be 404) and DB-down (should be 503)

**Fragile ObjectId comparison:**
- `auth.controller.js` `hasAuthorization` and `post.controller.js` `isPoster`
  use `==` between an ObjectId and a string — works via implicit coercion but
  should be `.equals()` or `String(...) ===`

**`dbErrorHandler` itself:**
- Duplicate-key field extraction breaks on new MongoDB message format
  (fix: use `err.keyValue` instead of parsing the message string)
- Multiple validation errors: `for...in` loop overwrites — only last error survives

### Planned fixes (not yet implemented)
1. Rewrite `dbErrorHandler.js` — use `err.name` branching, `err.keyValue` for
   duplicate keys, collect all validation errors
2. Fix `server.js` startup — await connection before listening, `process.exit(1)` on failure
3. Add 404 and catch-all error middleware to `express.js`
4. Fix crash paths in controllers (null checks, move `fs.readFileSync` inside try/catch)
5. Fix status codes (400 → 404/503 where appropriate)
6. Fix ObjectId comparisons → `.equals()`
7. Add tests for all new error branches (Level 1 tests will expand)
