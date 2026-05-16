# Changelog

All notable changes to **mern-social** (Chapter 05) are documented here.

---

## [Unreleased] — refactor/separate-client-server branch

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
