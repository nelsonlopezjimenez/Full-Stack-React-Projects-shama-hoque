# MERN Skeleton

The skeleton app from chapters 3 (backend) and 4 (frontend) of *Full-Stack React Projects*, migrated to a current stack.
It has sign-up, sign-in with JWT, a user list, and view/edit/delete for your own profile.

The code is split into **two independent packages**. Each has its own `package.json`, `node_modules`, tests and README:

| Folder | What | Stack |
|---|---|---|
| [`server/`](server/README.md) | JSON API | Node ≥ 22.9, Express 5, Mongoose 9, express-jwt 8 |
| [`client/`](client/README.md) | Single-page app | React 19, React Router 8, MUI 9, Vite 8 |

The server imports no client code, and the client knows only the `/api` URLs.
Either package can be deployed on its own.

## Run it (development)

You need Node 22.22+ and a running MongoDB.

```bash
# terminal 1 — API on http://localhost:3000
cd server
cp .env.example .env        # adjust MONGODB_URI / JWT_SECRET if needed
npm install
npm run dev

# terminal 2 — React app on http://localhost:5173 (forwards /api to the server)
cd client
npm install
npm run dev
```

Open http://localhost:5173.

## Run it as one process (production-like)

```bash
cd client && npm run build                     # writes client/dist
cd ../server && CLIENT_DIST=../client/dist npm start
```

Open http://localhost:3000. Express serves both the API and the built React app.
The `VAR=value command` form only works in bash. In PowerShell or cmd, put `CLIENT_DIST=../client/dist` in `server/.env` instead.

## Tests

```bash
cd server && npm test     # node:test, no database needed
cd client && npm test     # Vitest + Testing Library
```

`server/api.http` walks through the whole API against a running server (VS Code REST Client extension).

## API

| Method | Path | Auth |
|---|---|---|
| POST | `/api/users` | — (sign up) |
| GET | `/api/users` | — |
| GET | `/api/users/:userId` | token |
| PATCH | `/api/users/:userId` | token, owner |
| DELETE | `/api/users/:userId` | token, owner |
| POST | `/api/auth/sessions` | — (sign in) |
| DELETE | `/api/auth/sessions` | — (sign out) |

## What changed from the book

The migration was done in small steps on the branch `refactor/ch03-migration`. Each commit is one step, and the commits can be followed in order.

- Plan and decisions: [`chat/ch03-migration-checklist.md`](../../chat/ch03-migration-checklist.md)
- What each commit did, how it was checked, and what went wrong: [`chat/ch03-migration-log.md`](../../chat/ch03-migration-log.md)

The code has `[BEGINNER]` and `[ADVANCED]` comments that explain the modern patterns and compare them with the book's code:

```bash
git grep -n "\[BEGINNER\]\|\[ADVANCED\]" -- .
```

The original code (Node 8, Express 4, React 16, material-ui beta, webpack 4) is the parent of the first commit on that branch.
