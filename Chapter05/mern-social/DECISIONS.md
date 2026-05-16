# Architecture & Refactoring Decisions

## Project: mern-social (Chapter 05)
**Branch:** brooks-dev
**Last updated:** 2026-05-16

---

## 1. Upgrade Stack (completed)

Migrated from the original book stack to:

| Layer | Before | After |
|---|---|---|
| Node | <14 | >=20 |
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

## 5. Next Steps

- [ ] Folder separation: split `client/` and `server/` into independent packages
      with separate `package.json` files and a root orchestration `package.json`
- [ ] Merge `brooks-dev` → `main` after folder separation is tested
