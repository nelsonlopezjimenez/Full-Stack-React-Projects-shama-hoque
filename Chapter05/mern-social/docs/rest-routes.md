# MERN Social — Session Notes (2026-05-04)

---

## 1. Vite Migration (Webpack → Vite)

### Strategy: Drop SSR, separate ports, Vite client-only

| | Before | After |
|---|---|---|
| Client bundler | Webpack 5 + babel-loader | Vite 5 + `@vitejs/plugin-react` |
| Dev HMR | webpack-hot-middleware in Express | Vite dev server (port 5173) |
| API server | Express on 3333 (also did SSR + served bundle) | Express on 3333 (API only) |
| API proxying | N/A (same origin) | Vite proxies `/api`, `/auth` → 3333 |
| Production | webpack build → `/dist/bundle.js` | `vite build` → `/dist/client/`, Express serves it |

### How to run

```bash
# Terminal 1 — Express API (port 3333)
npm run dev

# Terminal 2 — Vite dev server (port 5173, proxies API calls to Express)
npm run dev:client

# Production build
npm run build   # vite build → dist/client/
npm start       # node server/server.js (serves dist/client/ statically)
```

### Key decisions

- **Dropped SSR** — Express is now a pure API server, no `renderToString`
- **`"type": "module"`** added to `package.json` — server files run as native ESM, no Babel needed
- **Explicit `.js` extensions** on all relative imports (required by Node ESM)
- **PNG import replaced** in `user.controller.js` — `import profileImage from '...png'` (webpack-only) replaced with `path.join(__dirname, ...)`
- **253 npm packages removed**, 18 added

### Files deleted
- `webpack.config.client.js`
- `webpack.config.client.production.js`
- `webpack.config.server.js`
- `server/devBundle.js`
- `template.js`

### Files created
- `index.html` — Vite entry point
- `vite.config.js` — React plugin + proxy to Express

---

## 2. `router.param` and Express parameter counts

### `router.param`

`router.param('userId', userCtrl.userByID)` is a **pre-hook** — Express automatically runs `userByID` before any route handler that has `:userId` in its path.

For this route:
```js
router.route('/api/users/:userId')
  .get(authCtrl.requireSignin, userCtrl.read)
```

The actual execution order is: `requireSignin` → **`userByID`** → `read`.

You never write `userCtrl.userByID` explicitly in the route definition; Express injects it whenever the param appears. It is a DRY way to load the user once and share it via `req.profile` across all routes that reference that user.

### Why different parameter counts

Express identifies function roles by the number of arguments declared (it checks `.length`):

**2 params — `(req, res)` — terminal route handler**
```js
const read = (req, res) => {
  return res.json(req.profile)  // sends response, nothing comes after
}
```
No `next` because this is the last stop.

**3 params — `(req, res, next)` — middleware**
```js
const photo = (req, res, next) => {
  if (req.profile.photo.data) {
    res.set('Content-Type', req.profile.photo.contentType)
    return res.send(req.profile.photo.data)
  }
  next()  // no photo stored → fall through to defaultPhoto
}
```
`next()` passes control to the next handler in the chain.

**4 params — `(req, res, next, id)` — `router.param` callback**
```js
const userByID = async (req, res, next, id) => {
  const user = await User.findById(id)  // id is the extracted URL value
  req.profile = user
  next()
}
```
The 4th argument `id` is the extracted URL parameter value. Express only recognizes a function as a param callback if it declares exactly 4 arguments.

**4 params — `(err, req, res, next)` — error handler**
```js
app.use((err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    res.status(401).json({ error: err.name + ': ' + err.message })
  }
})
```
Express detects error handlers because the first argument is `err`, not `req`.

### Summary table

| Signature | Role | Calls next? |
|---|---|---|
| `(req, res)` | Final handler | No |
| `(req, res, next)` | Middleware | Yes (conditionally) |
| `(req, res, next, id)` | `router.param` callback | Yes |
| `(err, req, res, next)` | Error handler | Optionally |

---

## 3. `req.profile` scope — is it global?

No. `req` is scoped to a single HTTP request. Each request has its own `req` object, created when the request arrives and garbage collected after the response is sent.

In the `read` function:
```js
const read = (req, res) => {
  req.profile.hashed_password = undefined
  req.profile.salt = undefined
  return res.json(req.profile)
}
```

Setting `hashed_password = undefined` mutates the in-memory Mongoose document **for this request only**. It does not call `.save()`, so nothing is written back to MongoDB. And since `read` is the final handler in the chain, nothing downstream is affected.

A cleaner alternative would be to use field exclusion on the query itself:
```js
User.findById(id).select('-hashed_password -salt')
```

---

## 4. REST Route Best Practices

### 1. Verbs in URLs — the most common REST violation

REST URLs should identify *resources*, not *actions*. The HTTP method is the verb.

| Current | Problem | Better |
|---|---|---|
| `POST /api/posts/new/:userId` | `/new` is a verb | `POST /api/posts` |
| `PUT /api/posts/like` | `like` is a verb | `POST /api/posts/:postId/likes` |
| `PUT /api/posts/unlike` | `unlike` is a verb | `DELETE /api/posts/:postId/likes` |
| `PUT /api/posts/comment` | `comment` is a verb | `POST /api/posts/:postId/comments` |
| `PUT /api/posts/uncomment` | `uncomment` is a verb | `DELETE /api/posts/:postId/comments/:commentId` |
| `GET /api/users/findpeople/:userId` | `findpeople` is a verb | `GET /api/users/:userId/suggestions` |
| `PUT /api/users/follow` | `follow` is a verb | `POST /api/users/:userId/follow` |
| `PUT /api/users/unfollow` | `unfollow` is a verb | `DELETE /api/users/:userId/follow` |

Likes and comments treated as sub-resources also move the resource identity from the **request body to the URL**, which is the correct place. Currently `postCtrl.like` reads `req.body.postId` — a resource identifier buried in the body is invisible to proxies, logs, and caches.

### 2. `GET /auth/signout` — GET should have no side effects

GET must be safe and idempotent. Signout clears a cookie — that is a side effect. It should be:
```
POST /auth/signout
```
Or if modeling the session as a resource:
```
DELETE /auth/session
```

### 3. Redundant `:userId` in auth-protected routes

`POST /api/posts/new/:userId` — the authenticated user is already available via JWT in `req.auth._id`. There is no reason to put `:userId` in the URL, and it creates a potential mismatch between who the JWT says you are and who the URL claims you are.

Same issue with `GET /api/posts/feed/:userId` — the feed is personal to the signed-in user:
```
GET /api/posts/feed    (req.auth._id drives the query)
```

### 4. `PUT` vs `PATCH` for partial updates

`PUT` means replace the entire resource. `PATCH` means partial update — which is what `update` actually does (only changed fields are sent):
```
PATCH /api/users/:userId
```

### 5. Inconsistent `/api` prefix

Auth routes use `/auth/signin` while everything else uses `/api/...`. Consistent convention:
```
POST /api/auth/signin
POST /api/auth/signout
```

### 6. Photo as a sub-resource

```
GET /api/users/photo/:userId    →    GET /api/users/:userId/photo
GET /api/posts/photo/:postId    →    GET /api/posts/:postId/photo
```

### `router.param` trade-off on writes

`router.param` runs a DB query on every route with `:userId`, even when the handler does its own atomic operation. For example, `remove` makes two DB hits:

```js
// userByID loads the user (hit 1)
// then remove does:
const deletedUser = await User.findByIdAndDelete(user._id)  // hit 2
```

One atomic call would be sufficient:
```js
const deletedUser = await User.findByIdAndDelete(req.params.userId)
```

Keep `router.param` for routes that genuinely need the loaded document (authorization checks, photo reads). Let write operations query directly.

### Cleaned-up route map

```
# Auth
POST   /api/auth/signin
POST   /api/auth/signout

# Users
GET    /api/users                        list all users
POST   /api/users                        register
GET    /api/users/:userId                get user
PATCH  /api/users/:userId                update user
DELETE /api/users/:userId                delete user
GET    /api/users/:userId/photo          profile photo
GET    /api/users/:userId/suggestions    people to follow
POST   /api/users/:userId/follow         follow user
DELETE /api/users/:userId/follow         unfollow user

# Posts
POST   /api/posts                        create post (poster = req.auth)
GET    /api/posts/feed                   news feed (req.auth drives query)
GET    /api/posts/by/:userId             posts by a specific user
DELETE /api/posts/:postId                delete post
GET    /api/posts/:postId/photo          post photo
POST   /api/posts/:postId/likes          like
DELETE /api/posts/:postId/likes          unlike
POST   /api/posts/:postId/comments       add comment
DELETE /api/posts/:postId/comments/:commentId  remove comment
```
