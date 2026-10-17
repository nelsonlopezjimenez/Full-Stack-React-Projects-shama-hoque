# Changelog

All notable changes to **mern-social** (Chapter 05) are documented here.

---

## [Unreleased] — refactor/separate-client-server branch

### Bug Fix: remove photo buffer from user list response

**File:** `server/controllers/user.controller.js` → `list()`

```js
// Before
User.find().select('name email updated created photo hashed_password')

// After
User.find().select('name email updated created hashed_password')
```

**Why:** The `GET /api/users` endpoint is used by the Users page to show a list
of names. Returning the binary photo buffer for every user in that list sent
unnecessary large payloads over the wire. Photos are fetched on demand via
`GET /api/users/:userId/photo`.

**Origin:** This fix was made in a separate web session on another machine and
committed directly to `origin/main` as commit `940d9c3` (author: localepsilon).
It was not present on this branch. Applied here manually — see the
*Cherry-picking* section at the bottom of this file for why manual was chosen
over `git cherry-pick`.

---

### Structural Refactor: Separate Client / Server Packages

Split the single-package project into independent frontend and backend packages,
each with its own `package.json`, `node_modules`, and scripts.

**New layout:**
```
mern-social/
├── package.json          ← root orchestration only
├── client/
│   ├── package.json      ← React/Vite deps
│   ├── index.html
│   ├── vite.config.js
│   └── src/              ← all React source (moved from client/)
└── server/
    ├── package.json      ← Express/Mongoose deps
    ├── nodemon.json
    ├── config/           ← moved from root config/
    └── ...
```

**Files moved:**
- `client/*` → `client/src/*` (history preserved via `git mv`)
- `index.html` → `client/index.html`
- `vite.config.js` → `client/vite.config.js`
- `config/config.js` → `server/config/config.js`
- `nodemon.json` → `server/nodemon.json`

**Paths updated:**
- `client/index.html` — entry script `/client/main.jsx` → `/src/main.jsx`
- `client/vite.config.js` — `outDir: '../dist/client'` (build still lands at root `dist/`)
- `server/server.js` — config import `./config/config.js`
- `server/controllers/auth.controller.js` — config import `../config/config.js`
- `server/controllers/user.controller.js` — `defaultPhoto` path updated for new `src/` level
- `server/nodemon.json` — watches `.`, runs `node server.js`

**Root scripts:**
```
npm run dev:server   → nodemon in server/
npm run dev:client   → vite in client/
npm run build        → vite build in client/
npm start            → node server.js in server/
```

---

## [3.1.0] — 2026-05-16 (brooks-dev)

### REST Route Refactor

Replaced RPC-style verb URLs and body-based IDs with noun-based REST routes.
Full rationale in [DECISIONS.md](./DECISIONS.md).

**Auth**
- `POST /auth/signin` → `POST /api/auth/sessions`
- `GET /auth/signout` → `DELETE /api/auth/sessions`
- Vite proxy `/auth` entry removed (now covered by `/api`)

**Users**
- `GET /api/users/photo/:userId` → `GET /api/users/:userId/photo`
- `PUT /api/users/follow` → `PUT /api/users/:userId/following/:targetId`
- `PUT /api/users/unfollow` → `DELETE /api/users/:userId/following/:targetId`
- `GET /api/users/findpeople/:userId` → `GET /api/users/:userId/suggestions`

**Posts**
- `POST /api/posts/new/:userId` → `POST /api/users/:userId/posts`
- `GET /api/posts/by/:userId` → `GET /api/users/:userId/posts`
- `GET /api/posts/feed/:userId` → `GET /api/users/:userId/feed`
- `GET /api/posts/photo/:postId` → `GET /api/posts/:postId/photo`
- `PUT /api/posts/like` → `POST /api/posts/:postId/likes`
- `PUT /api/posts/unlike` → `DELETE /api/posts/:postId/likes`
- `PUT /api/posts/comment` → `POST /api/posts/:postId/comments`
- `PUT /api/posts/uncomment` → `DELETE /api/posts/:postId/comments/:commentId`

**Server controller changes:**
- `follow/unfollow` — IDs from `req.body` → `req.params.userId` / `req.params.targetId`
- `like/unlike` — `req.body.postId` / `req.body.userId` → `req.post._id` / `req.auth._id`
- `comment` — `postedBy` set from `req.auth._id` instead of `req.body.userId`
- `uncomment` — comment ID from `req.params.commentId` instead of `req.body.comment._id`

**Client API function changes (`api-post.jsx`):**
- `like(credentials, postId)` — removed unused `params` arg
- `unlike(credentials, postId)` — same
- `comment(credentials, postId, comment)` — same
- `uncomment(credentials, postId, commentId)` — takes commentId string, not comment object

---

## [3.0.1] — 2026-05-15 (brooks-dev)

### Bug Fixes

**MUI Grid2 prop migration** (`client/src/core/Home.jsx`)
- `xs` / `sm` breakpoint props removed in MUI v6 Grid2
- Replaced with unified `size` prop: `size={12}`, `size={{ xs: 8, sm: 7 }}`

**`photo/undefined` on first render** (`client/src/post/NewPost.jsx`)
- `state.user` initialized as `{}` caused a request to `/api/users/undefined/photo`
  before `componentDidMount` ran
- Fixed by initializing from `auth.isAuthenticated()` directly in state declaration

**`listNewsFeed` CastError** (`server/controllers/post.controller.js`)
- `req.profile.following` is a populated array of `{ _id, name }` objects
- Pushing a raw ObjectId into it then querying with `$in` caused a Mongoose CastError
- Fixed with `.map(f => f._id)` before pushing the current user's ID

---

## [3.0.0] — 2026-05-05 (ch05-vite-migration → brooks-dev)

### Major Upgrade: Webpack/CRA → Vite + Full Stack Modernization

Migrated from the original book's stack to current LTS versions.

| Layer | Before | After |
|---|---|---|
| Node | 13 | ≥ 20 |
| React | 17 | 19 |
| MUI | v4 (`@material-ui`) | v6 (`@mui/material`) |
| Styling | `makeStyles` / JSS | `tss-react/mui` + MUI `sx` |
| React Router | v5 (`react-router-dom`) | v7 (`react-router`) |
| Mongoose | 6 | 8 |
| Build tool | Webpack (Create React App) | Vite 6 |
| Server dev | `nodemon` + webpack watch | `nodemon` + `vite` (separate ports) |

**Key migration notes:**
- Replaced all `makeStyles` / `withStyles` from `@material-ui/core` with
  `withStyles` from `tss-react/mui`
- React Router `<Switch>` → `<Routes>`, `useHistory` → `useNavigate`,
  `withRouter` HOC replaced with custom wrapper (`withRouter.jsx`)
- MUI Grid v1 → Grid2 (`@mui/material/Grid2`)
- Mongoose `findByIdAndUpdate` / `findByIdAndDelete` updated for v8 strict mode
- `formidable` updated for v2 API (`filepath` instead of `path`, array wrapping)
- SSR entry point removed; Vite serves client at `:5174`, Express at `:3333`
- `.env` added to `.gitignore`; `config/config.js` reads from `process.env`

---

## [1.0.0] — Original (Shama Hoque)

Initial implementation from the book
*Full-Stack React Projects* by Shama Hoque.

- MERN stack social media app (users, posts, follow, feed, likes, comments)
- Webpack + Babel build
- `@material-ui/core` v4
- React Router v5
- Mongoose v6
- Node 13

---

## Reference: Cherry-picking — what it is and when to use it

### What is a cherry-pick?

`git cherry-pick <commit-sha>` takes a single commit from any branch and
replays its diff on top of your current branch — without merging the entire
branch history. You get exactly that one change and nothing else.

```
origin/main:                  A --- B --- C(fix) --- D
                                           ↑
refactor/separate-client-server:  X --- Y --- Z
                                               ↓ cherry-pick C
                                  X --- Y --- Z --- C'
```

`C'` is a new commit with the same change as `C` but a different SHA, because
its parent is `Z` not `B`.

### The basic command

```bash
git cherry-pick 940d9c3
```

If it succeeds cleanly: git creates the new commit automatically.
If there are conflicts: git pauses, you resolve them, then:

```bash
git add <resolved-files>
git cherry-pick --continue   # finish the cherry-pick
# or
git cherry-pick --abort      # undo and go back to where you were
```

### Why we applied this one manually instead

The commit `940d9c3` touched `user.controller.js` on `origin/main`, which at
that point still had the old `req.body` follow/unfollow pattern and the old
`defaultPhoto` path. Our branch has the REST refactor and folder separation —
the same file looks quite different. Running `git cherry-pick 940d9c3` would
likely have produced a conflict in the lines surrounding the `list()` function.

For a one-line change it was faster and clearer to:
1. Read the diff (`git show 940d9c3`)
2. Apply the change by hand in the editor
3. Commit with a message referencing the original SHA

The result is identical to a successful cherry-pick.

### When to use cherry-pick vs. merge vs. manual

| Situation | Prefer |
|---|---|
| One useful commit buried in a branch full of unrelated work | `cherry-pick` |
| A hotfix on `main` that also needs to go on a release branch | `cherry-pick` |
| You want all the commits from a branch | `merge` or `rebase` |
| The target file has diverged significantly from the source | manual apply + reference commit in message |
| The change is trivial (one line) and context has changed | manual apply + reference commit in message |

### Keeping the audit trail

Whether you cherry-pick or apply manually, always reference the original commit
SHA in your commit message:

```
fix: remove photo buffer from list response

Port of 940d9c3 from origin/main (localepsilon, 2026-05-19).
Original commit left a commented-out line; cleaned up here.
```

This way `git log` tells the full story even when the SHA differs.
